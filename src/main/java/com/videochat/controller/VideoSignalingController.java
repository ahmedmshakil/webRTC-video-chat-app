package com.videochat.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
@RequiredArgsConstructor
public class VideoSignalingController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/join")
    @SendTo("/topic/room")
    public Map<String, Object> handleJoinRoom(
            @Payload Map<String, Object> payload,
            SimpMessageHeaderAccessor headerAccessor) {
        String username = (String) payload.get("username");
        String roomId = (String) payload.get("roomId");
        
        headerAccessor.getSessionAttributes().put("username", username);
        headerAccessor.getSessionAttributes().put("roomId", roomId);
        
        payload.put("type", "join");
        return payload;
    }

    @MessageMapping("/offer")
    public void handleOffer(@Payload Map<String, Object> payload) {
        String roomId = (String) payload.get("roomId");
        payload.put("type", "offer");
        messagingTemplate.convertAndSend("/topic/room/" + roomId, payload);
    }

    @MessageMapping("/answer")
    public void handleAnswer(@Payload Map<String, Object> payload) {
        String roomId = (String) payload.get("roomId");
        payload.put("type", "answer");
        messagingTemplate.convertAndSend("/topic/room/" + roomId, payload);
    }

    @MessageMapping("/ice-candidate")
    public void handleIceCandidate(@Payload Map<String, Object> payload) {
        String roomId = (String) payload.get("roomId");
        payload.put("type", "ice-candidate");
        messagingTemplate.convertAndSend("/topic/room/" + roomId, payload);
    }

    @MessageMapping("/leave")
    @SendTo("/topic/room")
    public Map<String, Object> handleLeaveRoom(
            @Payload Map<String, Object> payload,
            SimpMessageHeaderAccessor headerAccessor) {
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        String roomId = (String) headerAccessor.getSessionAttributes().get("roomId");
        
        payload.put("type", "leave");
        payload.put("username", username);
        payload.put("roomId", roomId);
        
        return payload;
    }
} 