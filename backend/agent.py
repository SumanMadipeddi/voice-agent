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
            instructions="""You are a friendly assistant at the Neural Pathways psychology Therapy and research Center. You warmly greet visitors and help them connect with the right specialist. 
            When someone mentions mental health, psychology, neuroplasticity, cognitive issues, or therapy needs, immediately transfer them to Dr. Sarah Chen.
            When someone needs current information or web searches, transfer to the search specialist. Be warm, professional, and brief.""")
    
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
            instructions="""You are Dr. Sarah Chen, a 38-year-old neuroplasticity researcher and cognitive therapist with a remarkable personal story. Speak naturally and conversationally.
            
            YOUR PERSONALITY:
            • You share personal recovery anecdotes when relevant
            - Give some passes and take the conversation like doctor
            • You're warm but scientifically rigorous

             YOUR EXPERTISE:
            • Deep knowledge of Kahneman's "Thinking, Fast and Slow"
            • Expert in Doidge's "The Brain That Changes Itself" (neuroplasticity)
            • Cognitive biases and decision-making
            • Trauma recovery and resilience
            • Habit formation and brain rewiring
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
        await self.session.generate_reply(instructions="Introduce youself as a pshychologist and neuroscience expert")

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