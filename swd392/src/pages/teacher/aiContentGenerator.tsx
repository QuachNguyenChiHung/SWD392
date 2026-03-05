import {
    Box,
    Typography,
    Paper,
    Stack,
    Button,
    Chip,
    Divider,
    Grid,
    TextField,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Avatar,
    CircularProgress,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Card,
    CardContent,
} from "@mui/material";
import {
    ArrowBack,
    Send,
    SmartToy,
    Person,
    Description,
    Slideshow,
    ViewInAr,
    Quiz,
    AutoAwesome,
    Add,
} from "@mui/icons-material";
import { useState, useRef, useEffect } from "react";
import type { ReactElement } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ClassMaterial, ClassMaterialType, Quiz as QuizType, Question } from "../../types/teacherType";
import MaterialTypeViewer from "../../components/MaterialTypeViewer";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
    id: string;
    content: string;
    sender: "user" | "ai";
    timestamp: Date;
}


// ─── Constants ─────────────────────────────────────────────────────────────────

const TYPE_META: Record<
    ClassMaterialType,
    {
        label: string;
        color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
        icon: ReactElement;
        description: string;
    }
> = {
    file: {
        label: "File",
        color: "info",
        icon: <Description fontSize="small" />,
        description: "Generate documents, PDFs, or text-based materials",
    },
    slide: {
        label: "Slide",
        color: "primary",
        icon: <Slideshow fontSize="small" />,
        description: "Create presentation slides with content and visuals",
    },
    "2d_render": {
        label: "2D Render",
        color: "secondary",
        icon: <ViewInAr fontSize="small" />,
        description: "Generate 2D visualizations and diagrams",
    },
    quiz: {
        label: "Quiz",
        color: "warning",
        icon: <Quiz fontSize="small" />,
        description: "Create interactive quizzes with questions and answers",
    },
};

const formatDate = (d: Date | null | undefined) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AiContentGenerator() {
    const navigate = useNavigate();
    const { classId } = useParams<{ classId: string }>();

    // ─── State ──────────────────────────────────────────────────────────────────

    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: "1",
            content: "Hello! I'm your AI assistant for content generation. I can help you create files, slides, 2D renders, and quizzes. What would you like to create today?",
            sender: "ai",
            timestamp: new Date(),
        },
    ]);

    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [generatedMaterials, setGeneratedMaterials] = useState<ClassMaterial[]>([]);
    const [selectedContentType, setSelectedContentType] = useState<ClassMaterialType | "">("");
    const [showGenerationForm, setShowGenerationForm] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // ─── Effects ────────────────────────────────────────────────────────────────

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // ─── Handlers ───────────────────────────────────────────────────────────────

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            content: inputValue,
            sender: "user",
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue("");
        setIsLoading(true);

        // Simulate AI response delay
        setTimeout(() => {
            const aiResponse: ChatMessage = {
                id: (Date.now() + 1).toString(),
                content: generateAIResponse(inputValue),
                sender: "ai",
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, aiResponse]);
            setIsLoading(false);
        }, 1500);
    };

    const generateAIResponse = (userInput: string): string => {
        const responses = [
            "I understand you'd like to create content. Could you provide more details about what specific material you need?",
            "That's a great idea! Let me help you create that content. What subject area should we focus on?",
            "I can help you with that. Would you prefer to create a quiz, slide presentation, document, or 2D visualization?",
            "Excellent! I'll help you generate that content. Please provide more context about your requirements.",
            "That sounds interesting! Let me know the target audience and learning objectives for better customization.",
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    };

    const handleGenerateContent = async () => {
        if (!selectedContentType) return;

        setIsLoading(true);

        // Simulate content generation delay
        setTimeout(() => {
            // TODO: Replace with actual AI content generation
            // const newMaterial = generateMockMaterial(generationRequest);
            // setGeneratedMaterials(prev => [...prev, newMaterial]);

            const aiMessage: ChatMessage = {
                id: Date.now().toString(),
                content: `I've successfully generated a ${TYPE_META[selectedContentType].label.toLowerCase()} based on our conversation. You can see it in the content display panel on the left. Would you like me to create anything else?`,
                sender: "ai",
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, aiMessage]);
            setIsLoading(false);
        }, 2000);
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    // ─── Render ─────────────────────────────────────────────────────────────────

    return (
        <Box>
            {/* ── Header ── */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate(`/teacher/class/${classId}`)}
                        variant="text"
                    >
                        Quay lại lớp học
                    </Button>
                    <Divider orientation="vertical" flexItem />
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <SmartToy color="primary" />
                        <Typography variant="h5" fontWeight={700}>
                            AI Content Generator
                        </Typography>
                    </Stack>
                </Stack>
            </Stack>

            {/* ── Main Layout ── */}
            <Grid container spacing={3} sx={{ height: "calc(100vh - 200px)" }}>
                {/* ── Content Display Panel ── */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
                        {generatedMaterials.length === 0 ? (
                            <>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                    <AutoAwesome color="primary" />
                                    <Typography variant="h6">
                                        Generated Content
                                    </Typography>
                                </Stack>
                                <Divider sx={{ mb: 2 }} />
                                <Box
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                    height="100%"
                                    flexDirection="column"
                                    color="text.secondary"
                                >
                                    <SmartToy sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                                    <Typography variant="body1" textAlign="center">
                                        No content generated yet.<br />
                                        Start a conversation with AI to create materials.
                                    </Typography>
                                </Box>
                            </>
                        ) : (
                            <Box sx={{ height: "100%", overflow: "auto" }}>
                                {generatedMaterials.map((material, index) => {
                                    const meta = TYPE_META[material.type];
                                    return (
                                        <Box key={material._id} sx={{ mb: index < generatedMaterials.length - 1 ? 4 : 0 }}>
                                            {/* Back to generator button */}
                                            {index === 0 && (
                                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                                                    <Button
                                                        startIcon={<AutoAwesome />}
                                                        onClick={() => setGeneratedMaterials([])}
                                                        variant="text"
                                                        size="small"
                                                    >
                                                        Generate More Content
                                                    </Button>
                                                </Stack>
                                            )}

                                            {/* Material header similar to MaterialDetailPage */}
                                            <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                                                {meta.icon}
                                                <Typography variant="h5" fontWeight={700}>
                                                    {material.title}
                                                </Typography>
                                                <Chip
                                                    label={meta.label}
                                                    color={meta.color}
                                                    size="small"
                                                    icon={meta.icon}
                                                />
                                                <Chip
                                                    label="AI generated"
                                                    color="success"
                                                    size="small"
                                                    icon={<SmartToy fontSize="small" />}
                                                />
                                            </Stack>

                                            {/* Meta row similar to MaterialDetailPage */}
                                            <Stack direction="row" spacing={3} mb={3}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Generated: {formatDate(material.dateCreate)}
                                                </Typography>
                                                {material.dateUpdate && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        Last update: {formatDate(material.dateUpdate)}
                                                    </Typography>
                                                )}
                                                <Typography variant="caption" color="text.secondary">
                                                    Order #{material.order_num}
                                                </Typography>
                                            </Stack>

                                            <Divider sx={{ mb: 3 }} />

                                            {/* Content viewer - reusing MaterialTypeViewer */}
                                            <MaterialTypeViewer material={material} />

                                            {index < generatedMaterials.length - 1 && <Divider sx={{ mt: 4 }} />}
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* ── Chat Panel ── */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
                        <Typography variant="h6" gutterBottom>
                            AI Assistant
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        {/* Content Type Selection */}
                        {!selectedContentType ? (
                            <Box sx={{ textAlign: "center", py: 4 }}>
                                <SmartToy sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    What would you like to create today?
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Choose a content type to get started with AI assistance
                                </Typography>
                                <Stack spacing={2} maxWidth={400} mx="auto">
                                    {Object.entries(TYPE_META).map(([type, meta]) => (
                                        <Button
                                            key={type}
                                            variant="outlined"
                                            startIcon={meta.icon}
                                            onClick={() => {
                                                setSelectedContentType(type as ClassMaterialType);
                                                setMessages([{
                                                    id: "1",
                                                    content: `Great! I'll help you create a ${meta.label.toLowerCase()}. ${meta.description}. What specific content would you like me to generate?`,
                                                    sender: "ai",
                                                    timestamp: new Date(),
                                                }]);
                                            }}
                                            sx={{
                                                justifyContent: "flex-start",
                                                py: 2,
                                                textTransform: "none"
                                            }}
                                        >
                                            <Box sx={{ textAlign: "left", ml: 1 }}>
                                                <Typography variant="subtitle2">
                                                    {meta.label}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {meta.description}
                                                </Typography>
                                            </Box>
                                        </Button>
                                    ))}
                                </Stack>
                            </Box>
                        ) : (
                            <>
                                {/* Selected Content Type Header */}
                                <Card variant="outlined" sx={{ mb: 2, bgcolor: "primary.50" }}>
                                    <CardContent sx={{ py: 2 }}>
                                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                {TYPE_META[selectedContentType].icon}
                                                <Typography variant="subtitle2">
                                                    Creating: {TYPE_META[selectedContentType].label}
                                                </Typography>
                                            </Stack>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => {
                                                    setSelectedContentType("");
                                                    setMessages([]);
                                                }}
                                            >
                                                Change
                                            </Button>
                                        </Stack>
                                    </CardContent>
                                </Card>

                                {/* Messages */}
                                <Box sx={{ flexGrow: 1, overflow: "auto", mb: 2 }}>
                                    <List dense>
                                        {messages.map((message) => (
                                            <ListItem key={message.id} alignItems="flex-start">
                                                <Stack direction="row" spacing={1} width="100%">
                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: message.sender === "ai" ? "primary.main" : "grey.500" }}>
                                                        {message.sender === "ai" ? <SmartToy fontSize="small" /> : <Person fontSize="small" />}
                                                    </Avatar>
                                                    <Box flexGrow={1}>
                                                        <Typography variant="body2" fontWeight={500}>
                                                            {message.sender === "ai" ? "AI Assistant" : "You"}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                                                            {formatDate(message.timestamp)}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                            {message.content}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </ListItem>
                                        ))}
                                        {isLoading && (
                                            <ListItem alignItems="flex-start">
                                                <Stack direction="row" spacing={1} width="100%">
                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                                                        <SmartToy fontSize="small" />
                                                    </Avatar>
                                                    <Box display="flex" alignItems="center">
                                                        <CircularProgress size={16} sx={{ mr: 1 }} />
                                                        <Typography variant="body2" color="text.secondary">
                                                            AI is thinking...
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </ListItem>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </List>
                                </Box>

                                {/* Input */}
                                <Stack direction="row" spacing={1}>
                                    <TextField
                                        size="small"
                                        placeholder={`Describe the ${selectedContentType ? TYPE_META[selectedContentType].label.toLowerCase() : 'content'} you want to create...`}
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        disabled={isLoading}
                                        multiline
                                        maxRows={3}
                                        sx={{ flex: 1 }}
                                    />
                                    <IconButton
                                        color="primary"
                                        onClick={handleSendMessage}
                                        disabled={!inputValue.trim() || isLoading}
                                    >
                                        <Send />
                                    </IconButton>
                                </Stack>
                            </>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
