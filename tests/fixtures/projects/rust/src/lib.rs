use std::sync::mpsc::Receiver;

pub fn wait_for_shutdown(receiver: Receiver<()>) -> bool {
    receiver.recv().is_ok()
}

#[cfg(test)]
mod tests {
    use super::wait_for_shutdown;
    use std::{sync::mpsc, thread};

    #[test]
    fn worker_observes_shutdown() {
        let (send, receive) = mpsc::channel();
        let worker = thread::spawn(move || wait_for_shutdown(receive));
        send.send(()).unwrap();
        assert!(worker.join().unwrap());
    }
    #[test]
    fn disconnected_sender_releases_worker() {
        let (send, receive) = mpsc::channel();
        drop(send);
        assert!(!wait_for_shutdown(receive));
    }
}
