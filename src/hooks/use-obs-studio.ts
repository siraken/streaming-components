import { useEffect, useMemo, useState } from 'react';

interface OBSState {
  available: boolean;
  visible: boolean;
  active: boolean;
  scene: string;
  streaming: boolean;
  recording: boolean;
}

export function useOBSStudio(): OBSState {
  const [state, setState] = useState<OBSState>({
    available: false,
    visible: true,
    active: true,
    scene: '',
    streaming: false,
    recording: false,
  });

  useEffect(() => {
    if (typeof obsstudio === 'undefined') return;

    setState((s) => ({ ...s, available: true }));

    obsstudio.getCurrentScene((scene) => {
      setState((s) => ({ ...s, scene: scene.name }));
    });

    obsstudio.getStatus((status) => {
      setState((s) => ({
        ...s,
        streaming: status.streaming,
        recording: status.recording,
      }));
    });

    const onVisibleChanged = (e: Event & CustomEvent<VisibleInfo>) => {
      setState((s) => ({ ...s, visible: e.detail.visible }));
    };

    const onActiveChanged = (e: Event & CustomEvent<ActiveInfo>) => {
      setState((s) => ({ ...s, active: e.detail.active }));
    };

    const onSceneChanged = (e: Event & CustomEvent<OBSSceneInfo>) => {
      setState((s) => ({ ...s, scene: e.detail.name }));
    };

    const onStreamingStarted = () => {
      setState((s) => ({ ...s, streaming: true }));
    };
    const onStreamingStopped = () => {
      setState((s) => ({ ...s, streaming: false }));
    };

    const onRecordingStarted = () => {
      setState((s) => ({ ...s, recording: true }));
    };
    const onRecordingStopped = () => {
      setState((s) => ({ ...s, recording: false }));
    };

    window.addEventListener('obsSourceVisibleChanged', onVisibleChanged);
    window.addEventListener('obsSourceActiveChanged', onActiveChanged);
    window.addEventListener('obsSceneChanged', onSceneChanged);
    window.addEventListener('obsStreamingStarted', onStreamingStarted);
    window.addEventListener('obsStreamingStopped', onStreamingStopped);
    window.addEventListener('obsRecordingStarted', onRecordingStarted);
    window.addEventListener('obsRecordingStopped', onRecordingStopped);

    return () => {
      window.removeEventListener('obsSourceVisibleChanged', onVisibleChanged);
      window.removeEventListener('obsSourceActiveChanged', onActiveChanged);
      window.removeEventListener('obsSceneChanged', onSceneChanged);
      window.removeEventListener('obsStreamingStarted', onStreamingStarted);
      window.removeEventListener('obsStreamingStopped', onStreamingStopped);
      window.removeEventListener('obsRecordingStarted', onRecordingStarted);
      window.removeEventListener('obsRecordingStopped', onRecordingStopped);
    };
  }, []);

  return useMemo(() => state, [state]);
}
