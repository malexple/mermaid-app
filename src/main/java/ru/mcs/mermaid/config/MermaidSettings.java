package ru.mcs.mermaid.config;

import lombok.Data;
import org.springframework.stereotype.Component;

@Data
@Component
public class MermaidSettings {

    // --- Общие ---
    private String theme = "default";          // default | dark | forest | neutral | base
    private String fontFamily = "trebuchet ms, verdana, arial";
    private int fontSize = 16;
    private boolean htmlLabels = true;
    private String securityLevel = "loose";    // strict | loose | antiscript
    private int maxTextSize = 50000;

    // --- Flowchart ---
    private int flowchartNodeSpacing = 50;
    private int flowchartRankSpacing = 50;
    private int flowchartWrappingWidth = 200;  // ширина переноса текста в узлах (px)
    private String flowchartCurve = "basis";   // basis | linear | cardinal

    // --- Sequence ---
    private int sequenceMessageMargin = 35;
    private boolean sequenceMirrorActors = false;
    private int sequenceBoxMargin = 10;

    // --- Er ---
    private int erEntityPadding = 15;
    private String erLayoutDirection = "TB";   // TB | BT | LR | RL

    // --- Общий вид ---
    private int diagramPadding = 8;
    private double zoom = 1.0;
}