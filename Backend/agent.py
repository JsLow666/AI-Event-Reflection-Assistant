from google.adk.agents import Agent
from google.adk.tools import google_search
from prompt import event_agent_prompt, reflection_agent_prompt
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
from google.genai import types # For creating message Content/Parts
import asyncio
import os
from uuid import uuid4

# --- Interact with the Agent ---
async def call_agent_async(query: str, runner, user_id, session_id):
  """Sends a query to the agent and prints the final response."""
  print(f"\n>>> User Query: {query}")
  print(f">>> Using Session ID: {session_id}, User ID: {user_id}")

  # Prepare the user's message in ADK format
  content = types.Content(role='user', parts=[types.Part(text=query)])

  final_response_text = "Agent did not produce a final response." # Default
  event_count = 0

  try:
    # Key Concept: run_async executes the agent logic and yields Events.
    # We iterate through events to find the final answer.
    async for event in runner.run_async(user_id=user_id, session_id=session_id, new_message=content):
        event_count += 1
        print(f">>> Event {event_count}: Type={type(event).__name__}")
        
        # Key Concept: is_final_response() marks the concluding message for the turn.
        if event.is_final_response():
            print(f">>> Final response event received")
            if event.content and event.content.parts:
               # Assuming text response in the first part
               final_response_text = event.content.parts[0].text
               print(f">>> Response text extracted: {final_response_text[:100]}...")
            elif event.actions and event.actions.escalate: # Handle potential errors/escalations
               final_response_text = f"Agent escalated: {event.error_message or 'No specific message.'}"
               print(f">>> Agent escalated: {final_response_text}")
            # Add more checks here if needed (e.g., specific error codes)
            break # Stop processing events once the final response is found
    
    if event_count == 0:
        print(">>> WARNING: No events received from agent")
  except Exception as e:
    print(f">>> ERROR in call_agent_async: {str(e)}")
    final_response_text = f"Error: {str(e)}"

  return final_response_text

async def analyze_event(event_title: str, event_runner, USER_ID, SESSION_ID):
    return await call_agent_async(
        query=event_title,
        runner=event_runner,
        user_id=USER_ID,
        session_id=SESSION_ID
    )


async def analyze_note(note: str, reflection_runner, USER_ID, SESSION_ID):
    return await call_agent_async(
        query=note,
        runner=reflection_runner,
        user_id=USER_ID,
        session_id=SESSION_ID
    )
async def prepare_reflection_agents():
    os.environ["GOOGLE_API_KEY"] = "AIzaSyB_0JUZjs7UWUYzgkP1xCZ2r_pXzOCIO5M"

    reflection_agent = Agent(
    name="ReflectionAgent",
    model="gemini-2.5-flash-lite",
    tools=[google_search],
    instruction=reflection_agent_prompt
)


    # Setup Session Service and Runner
    session_service = InMemorySessionService()

    # Define constants for identifying the interaction context
    APP_NAME = "schedule_manager_app"
    USER_ID = f"user_{uuid4()}"  # Generate unique user ID
    SESSION_ID = str(uuid4())  # Generate unique session ID

    async def init_session(app_name:str,user_id:str,session_id:str) -> InMemorySessionService:
        session = await session_service.create_session(
            app_name=app_name,
            user_id=user_id,
            session_id=session_id
        )
        print(f"Session created: App='{app_name}', User='{user_id}', Session='{session_id}'")
        return session

    session = await init_session(APP_NAME,USER_ID,SESSION_ID)

    reflection_runner = Runner(
    agent=reflection_agent, # The agents we want to run
    app_name=APP_NAME,   # Associates runs with our app
    session_service=session_service # Uses our session manager
    )
    print(f"Runner created for agent '{reflection_runner.agent}'.")

    return reflection_runner, USER_ID, SESSION_ID


async def prepare_event_agents():
    os.environ["GOOGLE_API_KEY"] = "AIzaSyB_0JUZjs7UWUYzgkP1xCZ2r_pXzOCIO5M"

    event_agent = Agent(
    name="EventUnderstandingAgent",
    model="gemini-2.5-flash-lite",
    tools=[google_search],
    description="Agent that analyzes scheduled activities using Google Search.",
    instruction=event_agent_prompt
)


    # Setup Session Service and Runner
    session_service = InMemorySessionService()

    # Define constants for identifying the interaction context
    APP_NAME = "schedule_manager_app"
    USER_ID = f"user_{uuid4()}"  # Generate unique user ID
    SESSION_ID = str(uuid4())  # Generate unique session ID

    async def init_session(app_name:str,user_id:str,session_id:str) -> InMemorySessionService:
        session = await session_service.create_session(
            app_name=app_name,
            user_id=user_id,
            session_id=session_id
        )
        print(f"Session created: App='{app_name}', User='{user_id}', Session='{session_id}'")
        return session

    session = await init_session(APP_NAME, USER_ID, SESSION_ID)

    event_runner = Runner(
    agent=event_agent, # The agents we want to run
    app_name=APP_NAME,   # Associates runs with our app
    session_service=session_service # Uses our session manager
    )
    print(f"Runner created for agent '{event_runner.agent}'.")

    return event_runner, USER_ID, SESSION_ID

if __name__ == "__main__":
    try:
        event_runner, USER_ID, SESSION_ID = prepare_event_agents()
        print(asyncio.run(analyze_event("15 Feb 2024: Law exam at 9 AM", event_runner, USER_ID, SESSION_ID)))
    except Exception as e:
        print(f"An error occurred: {e}")