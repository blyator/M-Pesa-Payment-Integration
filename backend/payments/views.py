from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
import json
import requests
from datetime import datetime
from django.conf import settings
from .utils import get_access_token, generate_password
from .models import Transaction
import os
from dotenv import load_dotenv

load_dotenv()



class InitiateSTKPush(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            amount = data.get('amount')
            phone = data.get('phone') 

            if not amount or not phone:
                return JsonResponse({'error': 'Amount and Phone are required'}, status=400)

            access_token = get_access_token()
            if not access_token:
                return JsonResponse({'error': 'Failed to authenticate with M-Pesa'}, status=503)

            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            password = generate_password(timestamp)
            
            callback_url = os.getenv("MPESA_CALLBACK_URL")
            if not callback_url:
                return JsonResponse({'error': 'MPESA_CALLBACK_URL not available'}, status=500)

            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }

            payload = {
                "BusinessShortCode": settings.MPESA_SHORTCODE,
                "Password": password,
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": amount,
                "PartyA": phone, 
                "PartyB": settings.MPESA_SHORTCODE, 
                "PhoneNumber": phone,
                "CallBackURL": callback_url,
                "AccountReference": "Blyator Technologies", 
                "TransactionDesc": "Payment for Services"
            }

            response = requests.post(
                f"{settings.MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest",
                json=payload,
                headers=headers
            )
            
            response_data = response.json()
            
            if response.status_code == 200:
                Transaction.objects.create(
                    phone_number=phone,
                    amount=amount,
                    checkout_request_id=response_data.get('CheckoutRequestID'),
                    merchant_request_id=response_data.get('MerchantRequestID'),
                    status='Pending'
                )
            
            return JsonResponse(response_data)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


# 2. CALLBACK HANDLER 
class MpesaCallback(View):
    def post(self, request):
        
        try:
            body = request.body.decode('utf-8')
            data = json.loads(body)
            
            
            stk_callback = data.get('Body', {}).get('stkCallback', {})
            checkout_request_id = stk_callback.get('CheckoutRequestID')
            result_code = stk_callback.get('ResultCode')
            
            transaction = Transaction.objects.filter(checkout_request_id=checkout_request_id).first()

            if result_code == 0:
                # SUCCESS
                metadata = stk_callback.get('CallbackMetadata', {}).get('Item', [])
                
                # Extract details (Receipt, Amount, Phone)
                mpesa_receipt = next((item['Value'] for item in metadata if item['Name'] == 'MpesaReceiptNumber'), None)

                
                if transaction:
                    transaction.status = 'Success'
                    transaction.mpesa_receipt_number = mpesa_receipt
                    transaction.save()
                
            else:
                # FAILED 
                print(f"Payment Failed. Code: {result_code}, Desc: {stk_callback.get('ResultDesc')}")
                if transaction:
                    if result_code == 1037:
                        transaction.status = 'Cancelled'
                    else:
                        transaction.status = 'Failed'
                    transaction.result_desc = stk_callback.get('ResultDesc', 'Failed')
                    transaction.save()

            # return a success response to Safaricom so they stop retrying
            return JsonResponse({"ResultCode": 0, "ResultDesc": "Accepted"})

        except Exception as e:
            print(f"Error processing callback: {e}")
            return JsonResponse({"error": "failed"}, status=500)

class CheckTransactionStatus(View):
    def get(self, request, checkout_request_id):
        try:
            transaction = Transaction.objects.filter(checkout_request_id=checkout_request_id).first()
            if transaction:
                return JsonResponse({
                    "status": transaction.status,
                    "receipt_number": transaction.mpesa_receipt_number,
                    "result_desc": transaction.result_desc
                })
            else:
                return JsonResponse({"error": "Transaction not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)