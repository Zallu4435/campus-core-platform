export interface Message {
    id: string;
    user: string;
    text: string;
    timestamp: string;
}

export interface Reaction {
    id: string;
    emoji: string;
    sender: string;
    timestamp: number;
    offset?: number;
}

export interface ChatPanelProps {
    isOpen: boolean;
    onClose: () => void;
    messages: Message[];
    onSend: (msg: string) => void;
}


export interface ControlBarProps {
    onToggleMic: () => void;
    onToggleCamera: () => void;
    onToggleHand: () => void;
    onSendReaction: (emoji: string) => void;
    onLeave: () => void;
    onShareScreen: () => void;
    onToggleChat: () => void;
    onToggleOthers: () => void;
    micOn: boolean;
    cameraOn: boolean;
    handRaised: boolean;
}

export interface HandRaiseIndicatorProps {
    show: boolean;
}

export interface ParticipantListProps {
    isOpen: boolean;
    onClose: () => void;
    participants: Participant[];
}


export type Participant = {
    id: string;
    name: string;
    videoOn: boolean;
    audioOn: boolean;
    handRaised: boolean;
    reaction?: string;
    profileUrl?: string;
    isHost?: boolean;
    isPresenting?: boolean;
    mediaStream?: MediaStream | null;
};

export interface VideoGridProps {
    participants: Participant[];
    compact?: boolean;
    maxVisible?: number;
    localParticipantId?: string;
    localStream?: MediaStream | null;
    screenShareStream?: MediaStream | null;
}

export interface TopBarProps {
    sessionName: string;
    meetingTimer: string;
    participantCount: number;
}

export interface ReactionsPanelProps {
    reactions: { [participantId: string]: string };
    onRemoveReaction: (participantId: string) => void;
}