from flask import Flask, render_template, request, jsonify
import requests
import logging
import json

app = Flask(__name__)

# Base API URL and Flow ID
BASE_API_URL = ""
FLOW_ID = ""

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    try:
        user_input = request.json.get('message')
    except KeyError:
        logging.error("JSON does not have 'message' key")
        return jsonify({'response': 'Error: Invalid input. Please provide a message.'}), 400

    logging.debug(f"Received user input: {user_input}")
    
    # Prepare the data to send in the POST request
    data = {
        "input_value": user_input,
        "output_type": "chat",
        "input_type": "chat",
        "tweaks": {
            "ChatInput-wbyi6": {},
            "Prompt-3PWMw": {},
            "ChatOutput-9dmUU": {},
            "OpenAIModel-H8HwO": {}
        }
    }
    logging.debug(f"Sending POST request with data: {json.dumps(data, indent=2)}")
    
    try:
        # Make the POST request to the flow API
        response = requests.post(
            f"{BASE_API_URL}/api/v1/run/{FLOW_ID}?stream=false",
            headers={'Content-Type': 'application/json'},
            json=data
        )
        
        # Log the response status and content
        logging.debug(f"Response status code: {response.status_code}")
        logging.debug(f"Response content: {response.content.decode('utf-8')}")

        if response.status_code == 200:
            response_data = response.json()
            logging.debug(f"Response JSON: {json.dumps(response_data, indent=2)}")

            # Attempt to extract the message from the response structure
            response_message = 'Error: Invalid response structure'
            try:
                if response_data['outputs']:
                    first_output = response_data['outputs'][0]['outputs'][0]
                    if 'messages' in first_output and first_output['messages']:
                        response_message = first_output['messages'][0].get('message', 'No message found')
                    else:
                        response_message = 'No messages found in outputs'
            except (KeyError, IndexError, TypeError) as e:
                logging.error(f"Error accessing the response structure: {e}")
                response_message = 'Error: Invalid response structure'
        else:
            response_message = f"Error: Unable to get a valid response. Status code: {response.status_code}"
    
    except requests.exceptions.RequestException as e:
        logging.error(f"Request failed: {e}")
        response_message = 'Error: Request to flow API failed'
    
    logging.debug(f"Final response to user: {response_message}")
    return jsonify({'response': response_message})

if __name__ == '__main__':
    app.run(debug=True)
