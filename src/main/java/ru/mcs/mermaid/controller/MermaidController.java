package ru.mcs.mermaid.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import ru.mcs.mermaid.dto.MermaidSettingsDto;
import ru.mcs.mermaid.config.MermaidSettings;

import java.util.Map;

@Slf4j
@Controller
@RequiredArgsConstructor
public class MermaidController {

    private final MermaidSettings settings;

    // GET /  —  главная страница
    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("settings", settings);
        return "index";
    }

    // GET /api/settings  —  текущие настройки как JSON (для JS при старте)
    @GetMapping("/api/settings")
    @ResponseBody
    public MermaidSettings getSettings() {
        return settings;
    }

    // POST /api/settings  —  обновить настройки из панели
    @PostMapping("/api/settings")
    @ResponseBody
    public ResponseEntity<?> updateSettings(
            @Valid @RequestBody MermaidSettingsDto dto,
            BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new java.util.LinkedHashMap<>();
            bindingResult.getFieldErrors()
                    .forEach(e -> errors.put(e.getField(), e.getDefaultMessage()));
            log.warn("Settings validation failed: {}", errors);
            return ResponseEntity.badRequest().body(errors);
        }

        applyDto(dto);
        log.debug("Settings updated: {}", settings);
        return ResponseEntity.ok(settings);
    }

    // POST /api/settings/reset  —  сброс к дефолтам
    @PostMapping("/api/settings/reset")
    @ResponseBody
    public MermaidSettings resetSettings() {
        applyDto(new MermaidSettingsDto());
        log.debug("Settings reset to defaults");
        return settings;
    }

    // Маппинг DTO → бин (явно, без BeanUtils — прозрачно и надёжно)
    private void applyDto(MermaidSettingsDto dto) {
        settings.setTheme(dto.getTheme());
        settings.setFontFamily(dto.getFontFamily());
        settings.setFontSize(dto.getFontSize());
        settings.setHtmlLabels(dto.isHtmlLabels());
        settings.setSecurityLevel(dto.getSecurityLevel());
        settings.setMaxTextSize(dto.getMaxTextSize());

        settings.setFlowchartNodeSpacing(dto.getFlowchartNodeSpacing());
        settings.setFlowchartRankSpacing(dto.getFlowchartRankSpacing());
        settings.setFlowchartWrappingWidth(dto.getFlowchartWrappingWidth());
        settings.setFlowchartCurve(dto.getFlowchartCurve());

        settings.setSequenceMessageMargin(dto.getSequenceMessageMargin());
        settings.setSequenceMirrorActors(dto.isSequenceMirrorActors());
        settings.setSequenceBoxMargin(dto.getSequenceBoxMargin());

        settings.setErEntityPadding(dto.getErEntityPadding());
        settings.setErLayoutDirection(dto.getErLayoutDirection());

        settings.setDiagramPadding(dto.getDiagramPadding());
        settings.setZoom((double) dto.getZoomPercent() / 100.0);
    }
}