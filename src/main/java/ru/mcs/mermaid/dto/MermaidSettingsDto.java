package ru.mcs.mermaid.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO для приёма настроек из формы / AJAX POST /api/settings.
 * Валидируется через @Valid в контроллере.
 */
@Data
public class MermaidSettingsDto {

    @NotBlank
    private String theme = "default";

    @NotBlank
    private String fontFamily = "trebuchet ms, verdana, arial";

    @Min(8) @Max(72)
    private int fontSize = 16;

    private boolean htmlLabels = true;

    @NotBlank
    private String securityLevel = "loose";

    @Min(1000) @Max(500000)
    private int maxTextSize = 50000;

    @Min(10) @Max(500)
    private int flowchartNodeSpacing = 50;

    @Min(10) @Max(500)
    private int flowchartRankSpacing = 50;

    @Min(50) @Max(2000)
    private int flowchartWrappingWidth = 200;

    @NotBlank
    private String flowchartCurve = "basis";

    @Min(5) @Max(200)
    private int sequenceMessageMargin = 35;

    private boolean sequenceMirrorActors = false;

    @Min(0) @Max(100)
    private int sequenceBoxMargin = 10;

    @Min(0) @Max(100)
    private int erEntityPadding = 15;

    @NotBlank
    private String erLayoutDirection = "TB";

    @Min(0) @Max(100)
    private int diagramPadding = 8;

    @Min(10) @Max(300)
    private int zoomPercent = 100;
}