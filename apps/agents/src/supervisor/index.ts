import { StateGraph, START, END } from "@langchain/langgraph";
import { tripPlannerGraph } from "../trip-planner";
import {
  SupervisorAnnotation,
  SupervisorState,
  SupervisorZodConfiguration,
} from "./types";
import { router } from "./nodes/router";
import { generalInput } from "./nodes/general-input";

export const ALL_TOOL_DESCRIPTIONS = `tripPlanner: helps the user plan their trip. It can show flight itineraries, book and cancel flights, and also suggest accommodations to stay in any given location.`;

function handleRoute(state: SupervisorState): "tripPlanner" | "generalInput" {
  return state.next;
}

const builder = new StateGraph(SupervisorAnnotation, SupervisorZodConfiguration)
  .addNode("router", router)
  .addNode("tripPlanner", tripPlannerGraph)
  .addNode("generalInput", generalInput)
  .addConditionalEdges("router", handleRoute, ["tripPlanner", "generalInput"])
  .addEdge(START, "router")
  .addEdge("tripPlanner", END)
  .addEdge("generalInput", END);

export const graph = builder.compile();
graph.name = "Generative UI Agent";
