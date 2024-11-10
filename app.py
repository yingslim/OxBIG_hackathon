# main.py
from chat.session import *
from config.settings import DEFAULT_SYSTEM_PROMPT


def main():
    print("Welcome to the OnDemand's CompulseControl Chatbot!\n")

    # Create a chat session
    session_id = create_chat_session()
    if not session_id:
        return

    # Prompt engineering: Set initial system prompt
    system_prompt = DEFAULT_SYSTEM_PROMPT 
    #input("\nEnter initial system prompt (for prompt engineering): ")

    # List to store plugin IDs for agent integration
    plugin_ids = [
        'plugin-1731166483', # transaction history
        'plugin-1716119225' # internet shopping pluggins
        # 'plugin-1716334779' # amazon shopping pluggins # unable to subscribe??
    ]


    print("\nYou can start chatting with the assistant. Type 'exit' to quit.")

    while True:
        user_message = input("\nYou: ")
        if user_message.strip().lower() == 'exit':
            print("Exiting the chatbot.")
            break
        

        # Combine system prompt and user message
        full_query = f"{system_prompt}\n{user_message}"

        # Submit query
        submit_query(session_id, full_query, plugin_ids)

if __name__ == "__main__":
    main()