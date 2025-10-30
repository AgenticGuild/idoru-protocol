package actions

import (
    "context"
    "errors"

    "github.com/ava-labs/hypersdk/chain"
    "github.com/ava-labs/hypersdk/codec"
    "github.com/yourorg/idoru_protocol/go/consts"
    "github.com/yourorg/idoru_protocol/go/storage"
)

type ResonanceAction struct {
    AgentID []byte `serialize:"true"`
    Value   uint64 `serialize:"true"`
}

func (*ResonanceAction) GetTypeID() uint8 { return consts.ResonanceID }

func (ra *ResonanceAction) StateKeys(actor codec.Address, _ chain.ID) chain.Keys {
    return chain.Keys{string(storage.AgentKey(ra.AgentID)): chain.Read | chain.Write}
}

func (ra *ResonanceAction) Execute(
    ctx context.Context,
    rules chain.Rules,
    mu chain.Mutable,
    now int64,
    actor codec.Address,
    txID chain.ID,
) (codec.Typed, error) {
    agent, err := storage.GetAgent(ctx, mu, ra.AgentID)
    if err != nil {
        return nil, errors.New("failed to get agent state")
    }
    // Update logic
    if ra.Value > agent.Resonance {
        agent.Resonance = ra.Value
    }
    // clamp with "resonanceMax" if desired
    if agent.Resonance > 1000 {
        agent.Resonance = 1000
    }
    if err := storage.SetAgent(ctx, mu, ra.AgentID, agent); err != nil {
        return nil, err
    }
    return &ResonanceResult{AgentID: ra.AgentID, NewValue: agent.Resonance}, nil
}

type ResonanceResult struct {
    AgentID  []byte `serialize:"true"`
    NewValue uint64 `serialize:"true"`
}

func (*ResonanceResult) GetTypeID() uint8 { return consts.ResonanceID } 