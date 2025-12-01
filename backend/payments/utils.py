import requests 
import base64
from datetime import datetime
from django.conf import settings

def get_access_token():
    consumer_key = settings.MPESA_CONSUMER_KEY
    consumer_secret = settings.MPESA_CONSUMER_SECRET
    api_URL = f"{settings.MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials"
    
    try:
        r = requests.get(api_URL, auth=(consumer_key, consumer_secret))
        r.raise_for_status() # Check for HTTP errors
        return r.json()['access_token']
    except Exception as e:
        print(f"Error generating access token: {e}")
        return None

def generate_password(formatted_time):
    
    #Generates the password required for STK Push.

    data_to_encode = settings.MPESA_SHORTCODE + settings.MPESA_PASSKEY + formatted_time
    encoded_string = base64.b64encode(data_to_encode.encode())
    return encoded_string.decode('utf-8')