"""
Test suite for AgentComponent and AgentLink models (ST-004)
Tests the behavior specified in Task 1 of 08-01-PLAN.md
"""

import pytest
from cubelets_mcp_server import AgentComponent, AgentLink, AnalyzeAgentFeedbackLoopsInput, Polarity
from pydantic import ValidationError


class TestAgentComponent:
    """Test AgentComponent model validation and behavior."""

    def test_valid_agent_component(self):
        """AgentComponent accepts valid input."""
        component = AgentComponent(
            id="agent-1",
            name="GPT-4 Router",
            component_type="agent",
            description="Routes requests"
        )
        assert component.id == "agent-1"
        assert component.name == "GPT-4 Router"
        assert component.component_type == "agent"

    def test_component_type_validation(self):
        """AgentComponent validates component_type is one of 5 fixed types."""
        valid_types = ["agent", "tool", "memory", "evaluator", "constraint"]
        for comp_type in valid_types:
            component = AgentComponent(
                id="test",
                name="Test Component",
                component_type=comp_type
            )
            assert component.component_type == comp_type

        # Invalid type should fail
        with pytest.raises(ValidationError):
            AgentComponent(
                id="test",
                name="Test",
                component_type="invalid_type"
            )

    def test_empty_id_rejected(self):
        """AgentComponent rejects empty id after whitespace stripping."""
        with pytest.raises(ValidationError):
            AgentComponent(id="", name="Test", component_type="agent")

        with pytest.raises(ValidationError):
            AgentComponent(id="   ", name="Test", component_type="agent")

    def test_empty_name_rejected(self):
        """AgentComponent rejects empty name after whitespace stripping."""
        with pytest.raises(ValidationError):
            AgentComponent(id="test", name="", component_type="agent")

        with pytest.raises(ValidationError):
            AgentComponent(id="test", name="   ", component_type="agent")


class TestAgentLink:
    """Test AgentLink model validation and to_causal_link transformation."""

    def test_valid_agent_link(self):
        """AgentLink accepts valid input."""
        link = AgentLink(
            from_component="a1",
            to_component="t1",
            polarity=Polarity.POSITIVE
        )
        assert link.from_component == "a1"
        assert link.to_component == "t1"
        assert link.polarity == Polarity.POSITIVE

    def test_strength_defaults_to_1(self):
        """AgentLink strength defaults to 1.0 when not provided."""
        link = AgentLink(
            from_component="a1",
            to_component="t1",
            polarity=Polarity.POSITIVE
        )
        assert link.strength == 1.0

    def test_to_causal_link_transformation(self):
        """AgentLink.to_causal_link() returns CausalLink with correct mapping."""
        link = AgentLink(
            from_component="a1",
            to_component="t1",
            polarity=Polarity.POSITIVE,
            strength=0.8
        )
        causal_link = link.to_causal_link()

        assert causal_link.from_var == "a1"
        assert causal_link.to_var == "t1"
        assert causal_link.polarity == Polarity.POSITIVE
        assert causal_link.strength == 0.8

    def test_to_causal_link_preserves_polarity(self):
        """AgentLink.to_causal_link() preserves negative polarity."""
        link = AgentLink(
            from_component="a1",
            to_component="t1",
            polarity=Polarity.NEGATIVE,
            strength=0.5
        )
        causal_link = link.to_causal_link()

        assert causal_link.polarity == Polarity.NEGATIVE
        assert causal_link.strength == 0.5

    def test_empty_from_component_rejected(self):
        """AgentLink rejects empty from_component."""
        with pytest.raises(ValidationError):
            AgentLink(from_component="", to_component="t1", polarity=Polarity.POSITIVE)

        with pytest.raises(ValidationError):
            AgentLink(from_component="   ", to_component="t1", polarity=Polarity.POSITIVE)

    def test_empty_to_component_rejected(self):
        """AgentLink rejects empty to_component."""
        with pytest.raises(ValidationError):
            AgentLink(from_component="a1", to_component="", polarity=Polarity.POSITIVE)

        with pytest.raises(ValidationError):
            AgentLink(from_component="a1", to_component="   ", polarity=Polarity.POSITIVE)


class TestAnalyzeAgentFeedbackLoopsInput:
    """Test AnalyzeAgentFeedbackLoopsInput model validation."""

    def test_valid_input(self):
        """AnalyzeAgentFeedbackLoopsInput accepts valid components and links."""
        components = [
            AgentComponent(id="a1", name="Agent", component_type="agent"),
            AgentComponent(id="t1", name="Tool", component_type="tool"),
        ]
        links = [
            AgentLink(from_component="a1", to_component="t1", polarity=Polarity.POSITIVE)
        ]

        input_data = AnalyzeAgentFeedbackLoopsInput(
            components=components,
            links=links
        )
        assert len(input_data.components) == 2
        assert len(input_data.links) == 1

    def test_cross_reference_validation(self):
        """AnalyzeAgentFeedbackLoopsInput validates links reference valid component IDs."""
        components = [
            AgentComponent(id="a1", name="Agent", component_type="agent"),
            AgentComponent(id="t1", name="Tool", component_type="tool"),
        ]

        # Link referencing non-existent component should fail
        links = [
            AgentLink(from_component="a1", to_component="invalid", polarity=Polarity.POSITIVE)
        ]

        with pytest.raises(ValidationError) as exc_info:
            AnalyzeAgentFeedbackLoopsInput(components=components, links=links)

        assert "not in component list" in str(exc_info.value).lower() or "invalid" in str(exc_info.value).lower()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
