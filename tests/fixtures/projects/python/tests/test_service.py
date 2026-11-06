import asyncio
import unittest
from service import wait


class CancellationTest(unittest.IsolatedAsyncioTestCase):
    async def test_cancellation_and_cleanup(self):
        entered = asyncio.Event()
        closed = []
        task = asyncio.create_task(wait(entered, closed))
        await asyncio.wait_for(entered.wait(), timeout=1)
        task.cancel()
        with self.assertRaises(asyncio.CancelledError):
            await task
        self.assertEqual(closed, [True])
