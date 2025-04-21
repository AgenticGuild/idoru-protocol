package vm

import (
    "github.com/ava-labs/hypersdk/vm"
    "github.com/ava-labs/hypersdk/chain"
    "github.com/yourorg/idoru_protocol/go/actions"
    "github.com/yourorg/idoru_protocol/go/consts"
)

type IdoruVM struct {
    vm.VM
}

func New() *IdoruVM {
    base := vm.New()
    base.RegisterAction(consts.ResonanceID, func() chain.Action { return &actions.ResonanceAction{} })
    base.RegisterAction(consts.BatchID, func() chain.Action { return &actions.SwarmBatch{} })
    return &IdoruVM{VM: *base}
} 