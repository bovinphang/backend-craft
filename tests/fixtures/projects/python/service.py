import asyncio


async def wait(entered: asyncio.Event, closed: list[bool]) -> int:
    try:
        entered.set()
        await asyncio.Future()
    except asyncio.CancelledError:
        raise
    finally:
        closed.append(True)
