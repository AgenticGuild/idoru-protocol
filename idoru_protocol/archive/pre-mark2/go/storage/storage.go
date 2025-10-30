package storage

import (
    "context"
    "encoding/binary"
    "github.com/ava-labs/hypersdk/chain"
)

type AgentState struct {
    Balance   uint64
    Resonance uint64
}

func AgentKey(id []byte) []byte {
    return append([]byte("agent_"), id...)
}

func encodeAgent(st AgentState) []byte {
    data := make([]byte, 16)
    binary.BigEndian.PutUint64(data[0:8], st.Balance)
    binary.BigEndian.PutUint64(data[8:16], st.Resonance)
    return data
}

func decodeAgent(data []byte) AgentState {
    if len(data) < 16 {
        return AgentState{}
    }
    bal := binary.BigEndian.Uint64(data[0:8])
    res := binary.BigEndian.Uint64(data[8:16])
    return AgentState{Balance: bal, Resonance: res}
}

func GetAgent(ctx context.Context, mu chain.Mutable, id []byte) (AgentState, error) {
    raw, err := mu.GetValue(ctx, AgentKey(id))
    if err != nil {
        return AgentState{}, err
    }
    if raw == nil {
        return AgentState{}, nil
    }
    return decodeAgent(raw), nil
}

func SetAgent(ctx context.Context, mu chain.Mutable, id []byte, st AgentState) error {
    data := encodeAgent(st)
    return mu.Insert(ctx, AgentKey(id), data)
} 