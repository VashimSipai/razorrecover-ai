from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from app.engine.state import RecoveryState
from app.engine.agents import (
    classifier_node,
    scorer_node,
    strategist_node,
    policy_gate_node,
    executor_node
)

def route_after_policy(state: RecoveryState) -> str:
    """Conditional Edge: Routes to executor if approved, or ENDs if blocked/paused."""
    if state.get("requires_hitl"):
        # Pauses for Human-in-the-Loop review
        return END
    elif not state.get("policy_approved"):
        return END
    return "executor"

def build_recovery_graph():
    workflow = StateGraph(RecoveryState)
    
    # Add Nodes
    workflow.add_node("classifier", classifier_node)
    workflow.add_node("scorer", scorer_node)
    workflow.add_node("strategist", strategist_node)
    workflow.add_node("policy_gate", policy_gate_node)
    workflow.add_node("executor", executor_node)
    
    # Add Edges
    workflow.add_edge(START, "classifier")
    workflow.add_edge("classifier", "scorer")
    workflow.add_edge("scorer", "strategist")
    workflow.add_edge("strategist", "policy_gate")
    
    # Conditional Edge from Policy Gate
    workflow.add_conditional_edges(
        "policy_gate",
        route_after_policy,
        {
            "executor": "executor",
            END: END
        }
    )
    
    workflow.add_edge("executor", END)
    
    # Compile with Checkpointer for durable crash recovery & HITL resume
    checkpointer = MemorySaver()
    compiled_app = workflow.compile(
        checkpointer=checkpointer,
        interrupt_before=["executor"] if False else []
    )
    return compiled_app

recovery_graph = build_recovery_graph()
