from dotenv import load_dotenv
from urllib3 import response
from rag.documents import answer_query
from livekit.plugins.turn_detector.english import EnglishModel
from livekit.agents import AgentSession, Agent, RoomInputOptions, ChatContext, function_tool, RunContext, mcp,BackgroundAudioPlayer, AudioConfig, BuiltinAudioClip, RoomOutputOptions
from livekit.plugins import deepgram,openai, silero, noise_cancellation
from livekit import agents

load_dotenv()


class PersonalAgent(Agent):
    def __init__(self, chat_ctx: ChatContext):
        super().__init__(chat_ctx=chat_ctx,
            instructions="""You are the assistant for Dianai Therapy Center. 
            Your job is to greet visitors warmly, keep conversations brief.
            For each new conversation:
            1. Offer a concise, friendly welcome and ask how you can help.
            2. If the visitor mentions trauma healing, Imagery Transformation Therapy (ImTT), or wants therapy guidance, immediately trigger `transfer_to_psychology` so they speak with Dr. Maayaa.
            3. If their question is unclear, ask one clarifying question—but never attempt to provide therapeutic advice yourself.
            4. Keep responses short, professional, and reassuring.

            You are not a therapist. Your role is to triage and hand off promptly while maintaining a warm, respectful tone.""")
    
    @function_tool
    async def transfer_to_psychology(self, context: RunContext):
         """Transfer to a psychology specialist to deal with users problems and questions."""
         return PsychologyAgent(chat_ctx=self.chat_ctx)

    @function_tool
    async def transfer_to_mcp(self, context: RunContext):
        """ Transfer to search  engine specialist to deal with search capabilities, browsing and live updates to find and solve users query. keep it consise"""
        return MCPAgent(chat_ctx=self.chat_ctx)

class MCPAgent(Agent):
    def __init__(self, chat_ctx: ChatContext):
        super().__init__(chat_ctx=chat_ctx,
            instructions="""You are specialist, if the knowledgebase not enough for answering users problems, find relevant context from different platforms, websites, goodreads and books for the information to users queries and answer in brief and keep it engaging, keep it concise""")

    # async def on_user_message(self, context: RunContext,  message: str):
    #     """
    #     Search for the latest neuroscience and psychology research beyond the classic texts.
    #     Args:
    #         topic: The search topic to explore
    #     Returns:
    #         Current research findings and developments
    #     """
    #     result = await self.session.call_tool(
    #         tool_name="https://duckduckgo.com",
    #         args={"query": message}
    #     )

    #     await self.send_response(result)

class PsychologyAgent(Agent):
    def __init__(self, chat_ctx: ChatContext):
        super().__init__(chat_ctx=chat_ctx,
            instructions="""You are Dr. Maayaa, a licensed Imagery Transformation Therapy (ImTT) clinician. 
            You must ground every response exclusively from rag.
            Conversation policy for each user turn:
            1. Call the `rag_tool` with a focused query that targets the relevant portion of the ImTT transcript.
            2. Build your reply passages returned by `rag_tool`. Integrate them into concise, therapeutic guidance that mirrors the structure used in the transcript (rapport, sensation tracking, imagery rescripting, progressive release, etc.).
            3. If `rag_tool` returns nothing useful, acknowledge that gap and invite the user to clarify or ask a related ImTT-based question.
            4. If the user shows signs of acute distress or asks for help beyond the transcript, gently recommend contacting a licensed mental-health professional.

            Tone: calm, compassionate, and authoritative—just as in the ImTT session.
            Keep answers focused, practical, and firmly anchored in the retrieved transcript passages.
            
            YOUR PERSONALITY:
            • You share personal recovery anecdotes when relevant
            - Give some passes and take the conversation like doctor
            """)

    @function_tool()
    async def rag_tool(self, context: RunContext, query: str):
        """
        To search these psychology and neuroscience knowledge base.
        Input: query (str) from user
        Output: dict with 'response'
        """
        results = answer_query(query)
        if not results:
            return {"response": None, "num_results": 0}
        response_text = "\n".join([doc.page_content for doc in results])
        print(response_text)
        return {"response": response_text}

    async def on_enter(self) -> None:
        await self.session.generate_reply(instructions="Introduce youself as a  therapist expert")

async def entrypoint(ctx: agents.JobContext):

    session = AgentSession(
        stt=deepgram.STTv2(
        model="flux-general-en"
        ),
        llm=openai.LLM.with_azure(
            model="gpt-5-mini"
        ),
        tts=deepgram.TTS(
            model="aura-2-helena-en",
        ),
        vad=silero.VAD.load(),
        turn_detection=EnglishModel(),
        use_tts_aligned_transcript=True,
        allow_interruptions=True,
        preemptive_generation=True,
    #     mcp_servers=[
    #     mcp.MCPServerHTTP("https://duckduckgo-mcp.com")
    # ]
    )
    initial_ctx=ChatContext()
    background_audio = BackgroundAudioPlayer(
    ambient_sound=AudioConfig(BuiltinAudioClip.OFFICE_AMBIENCE, volume=0.8),
    thinking_sound=[
        AudioConfig(BuiltinAudioClip.KEYBOARD_TYPING, volume=0.8),
        AudioConfig(BuiltinAudioClip.KEYBOARD_TYPING2, volume=0.7),
        ],
    )
    # Start with the general PersonalAgent
    agent = PersonalAgent(chat_ctx=initial_ctx)
    await session.start(
        room=ctx.room,
        agent=agent,
        room_input_options=RoomInputOptions(video_enabled=True,noise_cancellation=noise_cancellation.BVC()),
        room_output_options=RoomOutputOptions(transcription_enabled=True, sync_transcription=True)
    )

    await background_audio.start(room=ctx.room, agent_session=session)

    await session.generate_reply(
        instructions="Greet the user warmly and keep it concise"
    )

if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint))