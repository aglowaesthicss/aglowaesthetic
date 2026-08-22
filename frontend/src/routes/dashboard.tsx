import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Shield,
  Users,
  Layers,
  FileText,
  Calendar,
  MessageSquare,
  KeyRound,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Lock,
  Settings,
  Activity,
  Sparkles,
  Clock,
  CheckCircle,
  Eye,
  Percent,
  MapPin,
  Upload,
  UserCheck,
  X,
  Info
} from "lucide-react";

import { useAuth, User } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard | Aglow Aesthetics Portal" }],
  }),
  component: DashboardPage,
});

// Types for DB Records
interface Service {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  price?: number;
}

interface Offer {
  id: string;
  title: string;
  discount: string;
  description: string;
  promo_code?: string;
  start_date: string;
  end_date: string;
  special: boolean;
}

interface LocationRec {
  id: string;
  name: string;
  address: string;
  google_maps_iframe_url: string;
}

interface Testimonial {
  id: string;
  type: string;
  content_url?: string;
  text?: string;
  image_url?: string;
  author: string;
  treatment?: string;
}

interface ServiceHistory {
  id: string;
  client_user_id: string;
  client_name: string;
  client_email: string;
  service_name: string;
  date: string;
  price: number;
  invoice_url?: string;
  notes?: string;
}

interface Session {
  id: string;
  client_user_id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  service_name: string;
  date: string;
  time: string;
  status: string;
  reminder_sent?: boolean;
}

interface Feedback {
  id: string;
  client_user_id: string;
  client_name: string;
  client_email: string;
  type: "feedback" | "complaint";
  details: string;
  response?: string;
  created_at: string;
  responded_at?: string;
}

interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  service: string;
  created_at: string;
}

function DashboardPage() {
  const { user, isAuthenticated, loading, logout, hasAccess } = useAuth();
  const navigate = useNavigate();

  // Active Admin Tabs
  const [activeTab, setActiveTab] = useState("overview");

  // Data lists
  const [clients, setClients] = useState<User[]>([]);
  const [staffList, setStaffList] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [locations, setLocations] = useState<LocationRec[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [serviceHistories, setServiceHistories] = useState<ServiceHistory[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);

  // Access Control policy state
  const [policies, setPolicies] = useState<{ staff: string[]; client: string[] }>({
    staff: [],
    client: []
  });

  // LLM settings state
  const [llmProvider, setLlmProvider] = useState("gemini");
  const [llmKey, setLlmKey] = useState("");
  const [isLlmConfigured, setIsLlmConfigured] = useState(false);

  // Forms loading state
  const [loadingData, setLoadingData] = useState(false);

  // Modals & Creation States
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddHistory, setShowAddHistory] = useState(false);
  const [showAddSession, setShowAddSession] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingClient, setEditingClient] = useState<User | null>(null);
  const [showAddOffer, setShowAddOffer] = useState(false);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [showAddTestimonial, setShowAddTestimonial] = useState(false);
  
  // Feedback Reply State
  const [replyingFeedback, setReplyingFeedback] = useState<Feedback | null>(null);
  const [feedbackReplyText, setFeedbackReplyText] = useState("");

  // Update password states
  const [resettingUser, setResettingUser] = useState<User | null>(null);
  const [adminNewPassword, setAdminNewPassword] = useState("");

  // About Us Content Management states
  const [aboutIntro, setAboutIntro] = useState("");
  const [aboutTagline, setAboutTagline] = useState("");
  const [aboutParagraphs, setAboutParagraphs] = useState("");
  const [aboutImageUrl, setAboutImageUrl] = useState("");
  const [savingAbout, setSavingAbout] = useState(false);

  // Protected route check
  useEffect(() => {
    if (!loading && (!isAuthenticated || !user)) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, user, loading]);

  // Fetch Data on mount/role checks
  const fetchData = async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const role = user.role;
      
      // Load Enquiries (Admin + Staff)
      if (role !== "client") {
        const enquiriesData = await api.get<Enquiry[]>("/api/content/enquiries");
        setEnquiries(enquiriesData);
        
        const allUsers = await api.get<User[]>("/api/users");
        setClients(allUsers.filter(u => u.role === "client"));
        setStaffList(allUsers.filter(u => u.role !== "client"));
      }

      // Load Service History (Access Check)
      if (hasAccess("service_history")) {
        const historiesData = await api.get<ServiceHistory[]>("/api/records/history");
        setServiceHistories(historiesData);
      }

      // Load Session Tracking (Access Check)
      if (hasAccess("session_tracking")) {
        const sessionsData = await api.get<Session[]>("/api/records/sessions");
        setSessions(sessionsData);
      }

      // Load Feedbacks (Access Check)
      if (hasAccess("feedback")) {
        const feedbackData = await api.get<Feedback[]>("/api/feedback");
        setFeedbacks(feedbackData);
      }

      // Load Content
      const servicesData = await api.get<Service[]>("/api/content/services");
      setServices(servicesData);

      const offersData = await api.get<Offer[]>("/api/content/offers");
      setOffers(offersData);

      const locationsData = await api.get<LocationRec[]>("/api/content/locations");
      setLocations(locationsData);

      const testimonialsData = await api.get<Testimonial[]>("/api/content/testimonials");
      setTestimonials(testimonialsData);

      // Load Access Control settings (Admin only)
      if (role === "master_admin") {
        const accessData = await api.get<{ staff: string[]; client: string[] }>("/api/users/access-control");
        setPolicies(accessData);
        
        const chatSettings = await api.get<{ provider: string, api_key: string, configured: boolean }>("/api/chat/settings");
        setLlmProvider(chatSettings.provider);
        setIsLlmConfigured(chatSettings.configured);

        // Fetch About Us content
        try {
          const aboutRes = await api.get<any>("/api/content/about");
          setAboutIntro(aboutRes.intro || "");
          setAboutTagline(aboutRes.tagline || "");
          setAboutParagraphs(aboutRes.paragraphs ? aboutRes.paragraphs.join("\n\n") : "");
          setAboutImageUrl(aboutRes.image_url || "");
        } catch (e) {
          console.error("Failed to load about data on start:", e);
        }
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      toast.error("Failed to load records from database");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // --- ACTIONS ---

  // Create Staff Form Handlers
  const handleCreateStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = fd.get("email") as string;
    const name = fd.get("name") as string;
    const password = fd.get("password") as string;
    const role = fd.get("role") as string;

    try {
      await api.post("/api/users/staff", { email, name, password, role });
      toast.success(`Staff user ${name} created`);
      setShowAddStaff(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create staff");
    }
  };

  // Create Client Form Handlers
  const handleCreateClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = fd.get("email") as string;
    const name = fd.get("name") as string;
    const mobile_no = fd.get("mobile_no") as string;
    const age = parseInt(fd.get("age") as string);
    const location = fd.get("location") as string;
    const client_id = fd.get("client_id") as string;

    try {
      await api.post("/api/users/client", { email, name, mobile_no, age, location, client_id });
      // Calculate password digits
      const digits = mobile_no.replace(/\D/g, "");
      const tempPass = digits.length >= 5 ? digits.slice(-5) : "12345";
      
      toast.success("Client account created successfully", {
        description: `Credentials sent to ${email}. Temporary password: ${tempPass}`,
      });
      setShowAddClient(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create client");
    }
  };

  // Create Service History Form Handlers
  const handleCreateHistory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const client_user_id = fd.get("client_user_id") as string;
    const service_name = fd.get("service_name") as string;
    const date = fd.get("date") as string;
    const price = parseFloat(fd.get("price") as string);
    const notes = fd.get("notes") as string;
    const invoiceFile = fd.get("invoice_file") as File;

    try {
      let invoice_url = "";
      if (invoiceFile && invoiceFile.size > 0) {
        const uploadFd = new FormData();
        uploadFd.append("file", invoiceFile);
        const uploadRes = await api.post<{ url: string }>("/api/records/history/upload-invoice", uploadFd, true);
        invoice_url = uploadRes.url;
      }

      await api.post("/api/records/history", {
        client_user_id,
        service_name,
        date,
        price,
        invoice_url,
        notes
      });

      toast.success("Service history added successfully");
      setShowAddHistory(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to add service history");
    }
  };

  // Create Sessions Form Handlers
  const handleCreateSessions = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const client_user_id = fd.get("client_user_id") as string;
    const service_name = fd.get("service_name") as string;
    const date = fd.get("date") as string;
    const time = fd.get("time") as string;

    try {
      await api.post("/api/records/sessions", {
        client_user_id,
        service_name,
        slots: [{ date, time }]
      });

      toast.success("Treatment session scheduled");
      setShowAddSession(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to schedule session");
    }
  };

  // Create Service Form Handlers (Content)
  const handleCreateService = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const description = fd.get("description") as string;
    const category = fd.get("category") as string;
    const imageFile = fd.get("image_file") as File;

    try {
      let image_url = "";
      if (imageFile && imageFile.size > 0) {
        const uploadFd = new FormData();
        uploadFd.append("file", imageFile);
        const uploadRes = await api.post<{ url: string }>("/api/content/services/upload-image", uploadFd, true);
        image_url = uploadRes.url;
      }

      await api.post("/api/content/services", { name, description, image_url, category });
      toast.success("Service treatment created");
      setShowAddService(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create service");
    }
  };

  const handleUpdateService = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingService) return;
    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const description = fd.get("description") as string;
    const category = fd.get("category") as string;
    const imageFile = fd.get("image_file") as File;

    try {
      let image_url = editingService.image_url;
      if (imageFile && imageFile.size > 0) {
        const uploadFd = new FormData();
        uploadFd.append("file", imageFile);
        const uploadRes = await api.post<{ url: string }>("/api/content/services/upload-image", uploadFd, true);
        image_url = uploadRes.url;
      }

      await api.put(`/api/content/services/${editingService.id}`, {
        name,
        description,
        image_url,
        category
      });

      toast.success("Service treatment updated");
      setEditingService(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update service");
    }
  };

  const handleUpdateClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingClient) return;
    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const email = fd.get("email") as string;
    const mobile_no = fd.get("mobile_no") as string;
    const age = parseInt(fd.get("age") as string);
    const location = fd.get("location") as string;
    const client_id = fd.get("client_id") as string;

    try {
      await api.put(`/api/users/client/${editingClient.id}`, {
        name,
        email,
        mobile_no,
        age,
        location,
        client_id
      });

      toast.success("Client details updated successfully");
      setEditingClient(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update client");
    }
  };

  // Create Offer Form Handlers
  const handleCreateOffer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = fd.get("title") as string;
    const discount = fd.get("discount") as string;
    const description = fd.get("description") as string;
    const promo_code = fd.get("promo_code") as string;
    const start_date = fd.get("start_date") as string;
    const end_date = fd.get("end_date") as string;
    const special = fd.get("special") === "true";

    try {
      await api.post("/api/content/offers", {
        title,
        discount,
        description,
        promo_code,
        start_date,
        end_date,
        special
      });
      toast.success("Offer created and clients notified by email");
      setShowAddOffer(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create offer");
    }
  };

  // Create Location Form Handlers
  const handleCreateLocation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const address = fd.get("address") as string;
    const google_maps_iframe_url = fd.get("google_maps_iframe_url") as string;

    try {
      await api.post("/api/content/locations", { name, address, google_maps_iframe_url });
      toast.success("Branch location added");
      setShowAddLocation(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to add location");
    }
  };

  // Create Testimonial Form Handlers
  const handleCreateTestimonial = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const author = fd.get("author") as string;
    const treatment = fd.get("treatment") as string;
    const type = fd.get("type") as string;
    const text = fd.get("text") as string;
    const content_url = fd.get("content_url") as string;
    const imageFile = fd.get("image_file") as File;

    try {
      let image_url = "";
      if (imageFile && imageFile.size > 0) {
        const uploadFd = new FormData();
        uploadFd.append("file", imageFile);
        const uploadRes = await api.post<{ url: string }>("/api/content/testimonials/upload-image", uploadFd, true);
        image_url = uploadRes.url;
      }

      await api.post("/api/content/testimonials", {
        author,
        treatment,
        type,
        text,
        content_url,
        image_url
      });

      toast.success("Testimonial record added");
      setShowAddTestimonial(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to add testimonial");
    }
  };

  // Access Control Policy Updates
  const handleToggleFeature = async (role: "staff" | "client", feature: string) => {
    const list = policies[role];
    const isAllowed = list.includes(feature);
    const updatedList = isAllowed 
      ? list.filter(f => f !== feature) 
      : [...list, feature];
      
    try {
      await api.post("/api/users/access-control", {
        role,
        allowed_features: updatedList
      });
      setPolicies(prev => ({
        ...prev,
        [role]: updatedList
      }));
      toast.success(`Access control updated for ${role}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update access control");
    }
  };

  // LLM Settings Update Handlers
  const handleSaveLlmSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const provider = fd.get("provider") as string;
    const api_key = fd.get("api_key") as string;

    try {
      const data = await api.post<{ message: string }>("/api/chat/settings", { provider, api_key });
      toast.success(data.message);
      setIsLlmConfigured(true);
      setLlmKey("");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update LLM configuration");
    }
  };

  // Save About Us Content Handlers
  const handleSaveAboutInfo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingAbout(true);
    const fd = new FormData(e.currentTarget);
    const intro = fd.get("intro") as string;
    const tagline = fd.get("tagline") as string;
    const paragraphsRaw = fd.get("paragraphs") as string;
    const imageFile = fd.get("about_image_file") as File;

    const paragraphs = paragraphsRaw
      .split("\n")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    try {
      let image_url = aboutImageUrl;
      if (imageFile && imageFile.size > 0) {
        const uploadFd = new FormData();
        uploadFd.append("file", imageFile);
        const uploadRes = await api.post<{ url: string }>("/api/content/about/upload-image", uploadFd, true);
        image_url = uploadRes.url;
        setAboutImageUrl(image_url);
      }

      await api.post("/api/content/about", {
        intro,
        tagline,
        paragraphs,
        image_url
      });

      toast.success("About Us content updated successfully");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update About Us content");
    } finally {
      setSavingAbout(false);
    }
  };

  // Feedback Response Handler
  const handleReplyFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingFeedback) return;

    try {
      await api.post(`/api/feedback/${replyingFeedback.id}/reply`, {
        response: feedbackReplyText
      });
      toast.success("Response sent to client");
      setReplyingFeedback(null);
      setFeedbackReplyText("");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to reply to feedback");
    }
  };

  // Submit Feedback Handler (Client View)
  const handleSubmitFeedbackClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const type = fd.get("type") as string;
    const details = fd.get("details") as string;

    try {
      await api.post("/api/feedback", { type, details });
      toast.success("Feedback submitted", {
        description: "Our Head Admin will review it and reply shortly."
      });
      e.currentTarget.reset();
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit feedback");
    }
  };

  // Reset password by admin Handler
  const handleAdminResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser) return;

    try {
      await api.post("/api/auth/update-password-admin", {
        user_id: resettingUser.id,
        new_password: adminNewPassword
      });
      toast.success(`Password updated for user ${resettingUser.name}`);
      setResettingUser(null);
      setAdminNewPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update user password");
    }
  };

  // Delete handlers (Admin only)
  const handleDeleteItem = async (endpoint: string, id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      await api.delete(`${endpoint}/${id}`);
      toast.success("Record deleted");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Deletion failed");
    }
  };

  return (
    <div className="dark min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Dashboard Sub Header */}
      <section className="border-b border-border/60 bg-zinc-900/30">
        <div className="mx-auto max-w-6xl px-5 py-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[0.65rem] uppercase tracking-wider text-primary font-medium">
              Aglow Client & Staff Portal
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl mt-1 text-zinc-100">Welcome, {user.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="luxeOutline" size="sm">
              <Link to="/settings">Settings</Link>
            </Button>
            <Button onClick={logout} variant="destructive" size="sm" className="cursor-pointer">
              Logout
            </Button>
          </div>
        </div>
      </section>

      {/* Overview stats */}
      <div className="mx-auto max-w-6xl px-5 py-10">
        
        {/* --- CLIENT DASHBOARD VIEW --- */}
        {user.role === "client" && (
          <Tabs defaultValue="sessions" className="space-y-6">
            <TabsList className="bg-zinc-900/60 border border-border/40 p-1">
              <TabsTrigger value="sessions" className="text-xs uppercase tracking-wider">Sessions</TabsTrigger>
              {hasAccess("service_history") && (
                <TabsTrigger value="history" className="text-xs uppercase tracking-wider">Service History</TabsTrigger>
              )}
              {hasAccess("feedback") && (
                <TabsTrigger value="feedback" className="text-xs uppercase tracking-wider">Feedback & Complaints</TabsTrigger>
              )}
              <TabsTrigger value="offers" className="text-xs uppercase tracking-wider">Exclusive Offers</TabsTrigger>
            </TabsList>

            {/* Client Sessions */}
            <TabsContent value="sessions" className="space-y-6">
              <Card className="bg-zinc-900/40 border-border/80">
                <CardHeader>
                  <CardTitle className="font-serif text-xl text-primary">Your Upcoming Treatments</CardTitle>
                  <CardDescription>Track scheduled sessions for skin transformation.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sessions.length === 0 ? (
                    <p className="text-zinc-500 text-sm">You have no upcoming sessions scheduled.</p>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {sessions.map((s) => (
                        <div key={s.id} className="border border-border/60 bg-zinc-950 p-5 rounded-lg flex items-center justify-between">
                          <div className="space-y-2">
                            <h4 className="font-serif text-md text-zinc-100">{s.service_name}</h4>
                            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1.5"><Calendar className="size-3.5" /> {s.date}</span>
                              <span className="flex items-center gap-1.5"><Clock className="size-3.5" /> {s.time}</span>
                            </div>
                          </div>
                          <span className="rounded bg-primary/10 border border-primary/20 px-2 py-1 text-[0.65rem] tracking-wider text-primary uppercase">
                            {s.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Client Service History */}
            <TabsContent value="history" className="space-y-6">
              <Card className="bg-zinc-900/40 border-border/80">
                <CardHeader>
                  <CardTitle className="font-serif text-xl text-primary">Service Log & Invoices</CardTitle>
                  <CardDescription>View completed treatments and download receipts.</CardDescription>
                </CardHeader>
                <CardContent>
                  {serviceHistories.length === 0 ? (
                    <p className="text-zinc-500 text-sm">No service logs available.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-border text-muted-foreground uppercase tracking-wider font-light">
                            <th className="py-3">Date</th>
                            <th className="py-3">Treatment</th>
                            <th className="py-3">Amount</th>
                            <th className="py-3">Invoice</th>
                            <th className="py-3">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60 text-zinc-200">
                          {serviceHistories.map((h) => (
                            <tr key={h.id}>
                              <td className="py-4 font-light">{h.date}</td>
                              <td className="py-4 text-zinc-100 font-medium">{h.service_name}</td>
                              <td className="py-4 text-primary font-bold">₹{h.price}</td>
                              <td className="py-4">
                                {h.invoice_url ? (
                                  <a href={api.url(`/api/records/history/${h.id}/invoice?token=${localStorage.getItem("aglow_token")}`)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline font-medium">
                                    Invoice <ExternalLink className="size-3" />
                                  </a>
                                ) : <span className="text-zinc-600">N/A</span>}
                              </td>
                              <td className="py-4 text-muted-foreground">{h.notes || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Client Feedback */}
            <TabsContent value="feedback" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Submit Feedback */}
                <Card className="bg-zinc-900/40 border-border/80 h-fit">
                  <CardHeader>
                    <CardTitle className="font-serif text-xl text-primary">Submit Feedback / Complaint</CardTitle>
                    <CardDescription>Let us know your thoughts or report issues. We reply within 24 hours.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitFeedbackClient} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Select name="type" defaultValue="feedback">
                          <SelectTrigger id="type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="feedback">Feedback</SelectItem>
                            <SelectItem value="complaint">Complaint</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="details">Description</Label>
                        <textarea
                          id="details"
                          name="details"
                          required
                          rows={4}
                          placeholder="Provide details about your experience..."
                          className="w-full rounded border border-border/80 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 focus:border-primary/50 focus:outline-none transition-colors"
                        />
                      </div>
                      <Button type="submit" variant="luxe" className="w-full">
                        Submit Report
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Feedback History */}
                <Card className="bg-zinc-900/40 border-border/80">
                  <CardHeader>
                    <CardTitle className="font-serif text-xl text-primary">Your Past Messages</CardTitle>
                    <CardDescription>Track resolution states of your inquiries.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {feedbacks.length === 0 ? (
                      <p className="text-zinc-500 text-sm">No reports submitted.</p>
                    ) : (
                      feedbacks.map((f) => (
                        <div key={f.id} className="border border-border/60 bg-zinc-950 p-4 rounded-lg space-y-3">
                          <div className="flex justify-between items-center">
                            <span className={`text-[0.65rem] uppercase tracking-wider px-2 py-0.5 rounded ${
                              f.type === "complaint" ? "bg-red-500/10 border border-red-500/20 text-red-400" : "bg-primary/10 border border-primary/20 text-primary"
                            }`}>
                              {f.type}
                            </span>
                            <span className="text-[0.65rem] text-zinc-500">{f.created_at}</span>
                          </div>
                          <p className="text-xs text-zinc-300 font-light">{f.details}</p>
                          {f.response ? (
                            <div className="bg-zinc-900/60 border-l-2 border-primary/60 p-3 text-xs space-y-1 rounded-r">
                              <span className="text-primary font-medium block">Head Admin Reply:</span>
                              <p className="text-zinc-400 italic font-light">{f.response}</p>
                            </div>
                          ) : (
                            <span className="text-[0.65rem] text-orange-400 italic">Awaiting Response</span>
                          )}
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Client Offers View */}
            <TabsContent value="offers" className="space-y-6">
              <Card className="bg-zinc-900/40 border-border/80">
                <CardHeader>
                  <CardTitle className="font-serif text-xl text-primary">Exclusive Client Promotions</CardTitle>
                  <CardDescription>Claim active skincare offers.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  {offers.length === 0 ? (
                    <p className="text-zinc-500 text-sm">No active offers available currently.</p>
                  ) : (
                    offers.map((o) => (
                      <div key={o.id} className={`border p-5 rounded-lg space-y-3 ${
                        o.special ? "border-primary/50 bg-primary/5" : "border-border/60 bg-zinc-950"
                      }`}>
                        <h4 className="font-serif text-lg text-zinc-100">{o.title}</h4>
                        <span className="text-xl font-bold text-gold-gradient block">{o.discount}</span>
                        <p className="text-xs text-muted-foreground font-light leading-relaxed">{o.description}</p>
                        <div className="flex flex-wrap gap-4 items-center text-[0.65rem] text-zinc-500 pt-2">
                          {o.promo_code && <span className="border border-dashed border-primary/40 px-2 py-0.5 text-primary uppercase font-bold">{o.promo_code}</span>}
                          <span>Valid till {o.end_date}</span>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}


        {/* --- STAFF & MASTER ADMIN VIEWS --- */}
        {user.role !== "client" && (
          <div className="grid gap-8 md:grid-cols-[200px_1fr]">
            {/* Dashboard Sidebar Navigation */}
            <aside className="space-y-6">
              <nav className="flex flex-col gap-5">
                {/* 1. Manage Things / Portal Operations */}
                <div className="flex flex-col gap-1">
                  <span className="px-3 text-[0.65rem] uppercase font-bold tracking-[0.12em] text-zinc-500 mb-1.5 block">Manage Portal</span>
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`flex items-center gap-3 px-3 py-2 text-xs uppercase tracking-wider text-left transition-colors font-medium border-l-2 ${
                      activeTab === "overview" ? "border-primary text-primary bg-primary/5" : "border-transparent text-zinc-400 hover:text-zinc-100"
                    }`}
                  >
                    <Activity className="size-4" /> Overview
                  </button>
                  <button
                    onClick={() => setActiveTab("clients")}
                    className={`flex items-center gap-3 px-3 py-2 text-xs uppercase tracking-wider text-left transition-colors font-medium border-l-2 ${
                      activeTab === "clients" ? "border-primary text-primary bg-primary/5" : "border-transparent text-zinc-400 hover:text-zinc-100"
                    }`}
                  >
                    <Users className="size-4" /> Client List
                  </button>
                  
                  {hasAccess("service_history") && (
                    <button
                      onClick={() => setActiveTab("history")}
                      className={`flex items-center gap-3 px-3 py-2 text-xs uppercase tracking-wider text-left transition-colors font-medium border-l-2 ${
                        activeTab === "history" ? "border-primary text-primary bg-primary/5" : "border-transparent text-zinc-400 hover:text-zinc-100"
                      }`}
                    >
                      <FileText className="size-4" /> Service Logs
                    </button>
                  )}
                  
                  {hasAccess("session_tracking") && (
                    <button
                      onClick={() => setActiveTab("sessions")}
                      className={`flex items-center gap-3 px-3 py-2 text-xs uppercase tracking-wider text-left transition-colors font-medium border-l-2 ${
                        activeTab === "sessions" ? "border-primary text-primary bg-primary/5" : "border-transparent text-zinc-400 hover:text-zinc-100"
                      }`}
                    >
                      <Calendar className="size-4" /> Session Tracker
                    </button>
                  )}

                  <button
                    onClick={() => setActiveTab("enquiries")}
                    className={`flex items-center gap-3 px-3 py-2 text-xs uppercase tracking-wider text-left transition-colors font-medium border-l-2 ${
                      activeTab === "enquiries" ? "border-primary text-primary bg-primary/5" : "border-transparent text-zinc-400 hover:text-zinc-100"
                    }`}
                  >
                    <Eye className="size-4" /> Enquiries
                  </button>

                  {hasAccess("feedback") && (
                    <button
                      onClick={() => setActiveTab("feedback")}
                      className={`flex items-center gap-3 px-3 py-2 text-xs uppercase tracking-wider text-left transition-colors font-medium border-l-2 ${
                        activeTab === "feedback" ? "border-primary text-primary bg-primary/5" : "border-transparent text-zinc-400 hover:text-zinc-100"
                      }`}
                    >
                      <MessageSquare className="size-4" /> Feedback Logs
                    </button>
                  )}

                  {/* Master Admin restricted operations */}
                  {user.role === "master_admin" && (
                    <>
                      <button
                        onClick={() => setActiveTab("staff")}
                        className={`flex items-center gap-3 px-3 py-2 text-xs uppercase tracking-wider text-left transition-colors font-medium border-l-2 ${
                          activeTab === "staff" ? "border-primary text-primary bg-primary/5" : "border-transparent text-zinc-400 hover:text-zinc-100"
                        }`}
                      >
                        <UserCheck className="size-4" /> Staff Accounts
                      </button>
                      <button
                        onClick={() => setActiveTab("access")}
                        className={`flex items-center gap-3 px-3 py-2 text-xs uppercase tracking-wider text-left transition-colors font-medium border-l-2 ${
                          activeTab === "access" ? "border-primary text-primary bg-primary/5" : "border-transparent text-zinc-400 hover:text-zinc-100"
                        }`}
                      >
                        <Shield className="size-4" /> Access Controls
                      </button>
                    </>
                  )}
                </div>

                {/* 2. Web Content Settings */}
                {user.role === "master_admin" && (
                  <div className="flex flex-col gap-1">
                    <span className="px-3 text-[0.65rem] uppercase font-bold tracking-[0.12em] text-zinc-500 mb-1.5 block">Web Content</span>
                    <button
                      onClick={() => setActiveTab("content")}
                      className={`flex items-center gap-3 px-3 py-2 text-xs uppercase tracking-wider text-left transition-colors font-medium border-l-2 ${
                        activeTab === "content" ? "border-primary text-primary bg-primary/5" : "border-transparent text-zinc-400 hover:text-zinc-100"
                      }`}
                    >
                      <Layers className="size-4" /> Content Manager
                    </button>
                    <button
                      onClick={() => setActiveTab("about_us")}
                      className={`flex items-center gap-3 px-3 py-2 text-xs uppercase tracking-wider text-left transition-colors font-medium border-l-2 ${
                        activeTab === "about_us" ? "border-primary text-primary bg-primary/5" : "border-transparent text-zinc-400 hover:text-zinc-100"
                      }`}
                    >
                      <Info className="size-4" /> About Us Content
                    </button>
                    <button
                      onClick={() => setActiveTab("chatbot")}
                      className={`flex items-center gap-3 px-3 py-2 text-xs uppercase tracking-wider text-left transition-colors font-medium border-l-2 ${
                        activeTab === "chatbot" ? "border-primary text-primary bg-primary/5" : "border-transparent text-zinc-400 hover:text-zinc-100"
                      }`}
                    >
                      <Sparkles className="size-4" /> Chatbot AI Config
                    </button>
                  </div>
                )}
              </nav>
            </aside>

            {/* Active Content Window */}
            <main className="space-y-6">
              
              {/* --- OVERVIEW TAB --- */}
              {activeTab === "overview" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Card className="bg-zinc-900/40 border-border/80">
                      <CardHeader className="pb-2">
                        <CardDescription className="text-[0.65rem] uppercase tracking-wider">Total Clients</CardDescription>
                        <CardTitle className="text-3xl font-serif text-primary">{clients.length}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <span className="text-[0.65rem] text-zinc-500">Registered users in database</span>
                      </CardContent>
                    </Card>
                    <Card className="bg-zinc-900/40 border-border/80">
                      <CardHeader className="pb-2">
                        <CardDescription className="text-[0.65rem] uppercase tracking-wider">Scheduled Sessions</CardDescription>
                        <CardTitle className="text-3xl font-serif text-zinc-100">{sessions.length}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <span className="text-[0.65rem] text-zinc-500">Upcoming skin appointments</span>
                      </CardContent>
                    </Card>
                    <Card className="bg-zinc-900/40 border-border/80">
                      <CardHeader className="pb-2">
                        <CardDescription className="text-[0.65rem] uppercase tracking-wider">Pending Enquiries</CardDescription>
                        <CardTitle className="text-3xl font-serif text-zinc-100">{enquiries.filter(e => e.email).length}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <span className="text-[0.65rem] text-zinc-500">Public enquiries received</span>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-zinc-900/40 border-border/80">
                    <CardHeader>
                      <CardTitle className="font-serif text-lg text-primary">Aglow Aesthetics Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-3">
                      <Button onClick={() => setShowAddClient(true)} variant="luxe" className="cursor-pointer">
                        <Plus className="size-4 mr-1.5" /> Register Client
                      </Button>
                      {hasAccess("service_history") && (
                        <Button onClick={() => setShowAddHistory(true)} variant="luxeOutline" className="cursor-pointer">
                          <Plus className="size-4 mr-1.5" /> Record Service Log
                        </Button>
                      )}
                      {hasAccess("session_tracking") && (
                        <Button onClick={() => setShowAddSession(true)} variant="luxeOutline" className="cursor-pointer">
                          <Plus className="size-4 mr-1.5" /> Schedule Session
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* --- CLIENTS TAB --- */}
              {activeTab === "clients" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-serif text-xl text-primary">Client Directory</h2>
                      <p className="text-xs text-muted-foreground">Directory of registered clients.</p>
                    </div>
                    <Button onClick={() => setShowAddClient(true)} variant="luxe" size="sm">
                      <Plus className="size-4 mr-1.5" /> Add Client
                    </Button>
                  </div>

                  <Card className="bg-zinc-900/40 border-border/80">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-border text-muted-foreground uppercase tracking-wider font-light bg-zinc-900/30">
                              <th className="py-3 px-5">ID</th>
                              <th className="py-3 px-5">Name</th>
                              <th className="py-3 px-5">Mobile</th>
                              <th className="py-3 px-5">Age</th>
                              <th className="py-3 px-5">Location</th>
                              <th className="py-3 px-5">Email</th>
                              <th className="py-3 px-5 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60 text-zinc-200">
                            {clients.map((c) => (
                              <tr key={c.id} className="hover:bg-zinc-900/20">
                                <td className="py-3.5 px-5 font-mono text-[0.7rem] text-primary">{c.client_id || "N/A"}</td>
                                <td className="py-3.5 px-5 font-medium">{c.name}</td>
                                <td className="py-3.5 px-5">{c.mobile_no}</td>
                                <td className="py-3.5 px-5">{c.age}</td>
                                <td className="py-3.5 px-5">{c.location}</td>
                                <td className="py-3.5 px-5 text-zinc-400">{c.email}</td>
                                <td className="py-3.5 px-5 text-right space-x-2">
                                  <button 
                                    onClick={() => setEditingClient(c)} 
                                    className="text-zinc-400 hover:text-zinc-100 transition-colors mr-2"
                                    title="Edit Client"
                                  >
                                    <Edit className="size-3.5 inline" />
                                  </button>
                                  {user.role === "master_admin" && (
                                    <>
                                      <button 
                                        onClick={() => setResettingUser(c)} 
                                        className="text-primary hover:underline text-[0.7rem] mr-2"
                                      >
                                        Reset Pwd
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteItem("/api/users", c.id)} 
                                        className="text-red-500 hover:text-red-400 transition-colors"
                                      >
                                        <Trash2 className="size-3.5 inline" />
                                      </button>
                                    </>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* --- ENQUIRIES TAB --- */}
              {activeTab === "enquiries" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div>
                    <h2 className="font-serif text-xl text-primary">Public Consultations & Enquiries</h2>
                    <p className="text-xs text-muted-foreground">View and follow up with leads submitted from the public site.</p>
                  </div>

                  <Card className="bg-zinc-900/40 border-border/80">
                    <CardContent className="p-0">
                      {enquiries.length === 0 ? (
                        <p className="text-zinc-500 text-sm p-6">No enquiry records available.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-border text-muted-foreground uppercase tracking-wider font-light bg-zinc-900/30">
                                <th className="py-3 px-5">Date</th>
                                <th className="py-3 px-5">Name</th>
                                <th className="py-3 px-5">Phone</th>
                                <th className="py-3 px-5">Email</th>
                                <th className="py-3 px-5">Location</th>
                                <th className="py-3 px-5">Treatment Interested</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60 text-zinc-200">
                              {enquiries.map((e) => (
                                <tr key={e.id} className="hover:bg-zinc-900/20">
                                  <td className="py-3.5 px-5 text-zinc-500">{e.created_at}</td>
                                  <td className="py-3.5 px-5 font-medium text-zinc-100">{e.name}</td>
                                  <td className="py-3.5 px-5">
                                    <a href={`tel:${e.phone}`} className="hover:text-primary transition-colors">{e.phone}</a>
                                  </td>
                                  <td className="py-3.5 px-5 text-zinc-400">
                                    <a href={`mailto:${e.email}`} className="hover:text-primary transition-colors">{e.email}</a>
                                  </td>
                                  <td className="py-3.5 px-5">{e.location}</td>
                                  <td className="py-3.5 px-5"><span className="text-primary font-medium">{e.service}</span></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* --- STAFF MANAGEMENT TAB (ADMIN ONLY) --- */}
              {activeTab === "staff" && user.role === "master_admin" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-serif text-xl text-primary">Staff Directory</h2>
                      <p className="text-xs text-muted-foreground">Manage administrative and front office staff accounts.</p>
                    </div>
                    <Button onClick={() => setShowAddStaff(true)} variant="luxe" size="sm">
                      <Plus className="size-4 mr-1.5" /> Add Staff
                    </Button>
                  </div>

                  <Card className="bg-zinc-900/40 border-border/80">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-border text-muted-foreground uppercase tracking-wider font-light bg-zinc-900/30">
                              <th className="py-3 px-5">Name</th>
                              <th className="py-3 px-5">Email</th>
                              <th className="py-3 px-5">Role</th>
                              <th className="py-3 px-5 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60 text-zinc-200">
                            {staffList.map((s) => (
                              <tr key={s.id} className="hover:bg-zinc-900/20">
                                <td className="py-3.5 px-5 font-medium">{s.name}</td>
                                <td className="py-3.5 px-5 text-zinc-400">{s.email}</td>
                                <td className="py-3.5 px-5">
                                  <span className={`px-2 py-0.5 rounded text-[0.65rem] tracking-wider uppercase font-semibold ${
                                    s.role === "master_admin" ? "bg-primary/20 text-primary border border-primary/30" : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                                  }`}>
                                    {s.role.replace("_", " ")}
                                  </span>
                                </td>
                                <td className="py-3.5 px-5 text-right space-x-3">
                                  <button 
                                    onClick={() => setResettingUser(s)} 
                                    className="text-primary hover:underline text-[0.7rem]"
                                  >
                                    Reset Pwd
                                  </button>
                                  {s.email !== user.email && (
                                    <button 
                                      onClick={() => handleDeleteItem("/api/users", s.id)} 
                                      className="text-red-500 hover:text-red-400 transition-colors"
                                    >
                                      <Trash2 className="size-4 inline" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* --- SERVICE HISTORIES TAB --- */}
              {activeTab === "history" && hasAccess("service_history") && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-serif text-xl text-primary">Service Histories</h2>
                      <p className="text-xs text-muted-foreground">Manage client previous treatments and billing records.</p>
                    </div>
                    <Button onClick={() => setShowAddHistory(true)} variant="luxe" size="sm">
                      <Plus className="size-4 mr-1.5" /> Log Service History
                    </Button>
                  </div>

                  <Card className="bg-zinc-900/40 border-border/80">
                    <CardContent className="p-0">
                      {serviceHistories.length === 0 ? (
                        <p className="text-zinc-500 text-sm p-6">No service histories logged.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-border text-muted-foreground uppercase tracking-wider font-light bg-zinc-900/30">
                                <th className="py-3 px-5">Date</th>
                                <th className="py-3 px-5">Client</th>
                                <th className="py-3 px-5">Treatment</th>
                                <th className="py-3 px-5">Invoice</th>
                                <th className="py-3 px-5">Amount</th>
                                <th className="py-3 px-5 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60 text-zinc-200">
                              {serviceHistories.map((h) => (
                                <tr key={h.id} className="hover:bg-zinc-900/20">
                                  <td className="py-3.5 px-5 text-zinc-400 font-light">{h.date}</td>
                                  <td className="py-3.5 px-5">
                                    <div>
                                      <p className="font-medium text-zinc-100">{h.client_name}</p>
                                      <p className="text-[0.7rem] text-zinc-500">{h.client_email}</p>
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-5 text-zinc-100 font-medium">{h.service_name}</td>
                                  <td className="py-3.5 px-5">
                                    {h.invoice_url ? (
                                      <a href={api.url(`/api/records/history/${h.id}/invoice?token=${localStorage.getItem("aglow_token")}`)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline font-medium">
                                        View PDF <ExternalLink className="size-3" />
                                      </a>
                                    ) : <span className="text-zinc-600">No invoice</span>}
                                  </td>
                                  <td className="py-3.5 px-5 text-primary font-bold">₹{h.price}</td>
                                  <td className="py-3.5 px-5 text-right">
                                    {user.role === "master_admin" && (
                                      <button 
                                        onClick={() => handleDeleteItem("/api/records/history", h.id)} 
                                        className="text-red-500 hover:text-red-400 transition-colors"
                                      >
                                        <Trash2 className="size-4" />
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* --- SESSIONS TAB --- */}
              {activeTab === "sessions" && hasAccess("session_tracking") && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-serif text-xl text-primary">Treatment Sessions</h2>
                      <p className="text-xs text-muted-foreground">Manage client schedules and track appointment reminders.</p>
                    </div>
                    <Button onClick={() => setShowAddSession(true)} variant="luxe" size="sm">
                      <Plus className="size-4 mr-1.5" /> Schedule Session
                    </Button>
                  </div>

                  <Card className="bg-zinc-900/40 border-border/80">
                    <CardContent className="p-0">
                      {sessions.length === 0 ? (
                        <p className="text-zinc-500 text-sm p-6">No scheduled sessions logged.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-border text-muted-foreground uppercase tracking-wider font-light bg-zinc-900/30">
                                <th className="py-3 px-5">Date</th>
                                <th className="py-3 px-5">Time</th>
                                <th className="py-3 px-5">Client Name</th>
                                <th className="py-3 px-5">Treatment</th>
                                <th className="py-3 px-5">Reminder</th>
                                <th className="py-3 px-5">Status</th>
                                <th className="py-3 px-5 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60 text-zinc-200">
                              {sessions.map((s) => (
                                <tr key={s.id} className="hover:bg-zinc-900/20">
                                  <td className="py-3.5 px-5 text-zinc-300 font-light">{s.date}</td>
                                  <td className="py-3.5 px-5 font-mono">{s.time}</td>
                                  <td className="py-3.5 px-5">
                                    <div>
                                      <p className="font-medium text-zinc-100">{s.client_name}</p>
                                      <p className="text-[0.7rem] text-zinc-500">{s.client_phone}</p>
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-5 text-zinc-100">{s.service_name}</td>
                                  <td className="py-3.5 px-5">
                                    {s.reminder_sent ? (
                                      <span className="flex items-center gap-1 text-green-400 text-[0.65rem] uppercase font-bold">
                                        <CheckCircle className="size-3" /> Sent
                                      </span>
                                    ) : <span className="text-zinc-600 text-[0.65rem]">Awaiting cron</span>}
                                  </td>
                                  <td className="py-3.5 px-5">
                                    <span className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-[0.65rem] text-primary uppercase font-medium">
                                      {s.status}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-5 text-right">
                                    {user.role === "master_admin" && (
                                      <button 
                                        onClick={() => handleDeleteItem("/api/records/sessions", s.id)} 
                                        className="text-red-500 hover:text-red-400 transition-colors"
                                      >
                                        <Trash2 className="size-4" />
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* --- ACCESS CONTROL TAB (ADMIN ONLY) --- */}
              {activeTab === "access" && user.role === "master_admin" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div>
                    <h2 className="font-serif text-xl text-primary">Feature Access Controls</h2>
                    <p className="text-xs text-muted-foreground">Grant or revoke access to the 7 core features for each portal role dynamically.</p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Staff Access Checklist */}
                    <Card className="bg-zinc-900/40 border-border/80">
                      <CardHeader>
                        <CardTitle className="font-serif text-md text-primary">Staff / Front Office Role Permissions</CardTitle>
                        <CardDescription>Configure which tabs staff can view and manage.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { key: "service_history", label: "Service History Management" },
                          { key: "session_tracking", label: "Session Schedules Manager" },
                          { key: "feedback", label: "Feedback & Complaint Viewer" },
                        ].map((f) => (
                          <div key={f.key} className="flex items-center space-x-3">
                            <Checkbox 
                              id={`staff-${f.key}`}
                              checked={policies.staff.includes(f.key)}
                              onCheckedChange={() => handleToggleFeature("staff", f.key)}
                            />
                            <Label htmlFor={`staff-${f.key}`} className="text-zinc-200 cursor-pointer">{f.label}</Label>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Client Access Checklist */}
                    <Card className="bg-zinc-900/40 border-border/80">
                      <CardHeader>
                        <CardTitle className="font-serif text-md text-primary">Client Role Permissions</CardTitle>
                        <CardDescription>Configure client portal features availability.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { key: "service_history", label: "View Personal Service Log" },
                          { key: "session_tracking", label: "View Scheduled Sessions" },
                          { key: "feedback", label: "Submit Feedback & Complaints" },
                          { key: "offers", label: "View Promotions & Offers" },
                          { key: "location", label: "View Branch Maps & Locations" },
                          { key: "testimonial", label: "View Testimonials Feed" },
                        ].map((f) => (
                          <div key={f.key} className="flex items-center space-x-3">
                            <Checkbox 
                              id={`client-${f.key}`}
                              checked={policies.client.includes(f.key)}
                              onCheckedChange={() => handleToggleFeature("client", f.key)}
                            />
                            <Label htmlFor={`client-${f.key}`} className="text-zinc-200 cursor-pointer">{f.label}</Label>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* --- CHATBOT CONFIG TAB (ADMIN ONLY) --- */}
              {activeTab === "chatbot" && user.role === "master_admin" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div>
                    <h2 className="font-serif text-xl text-primary">RAG Chatbot LLM Settings</h2>
                    <p className="text-xs text-muted-foreground">Select LLM provider and input credentials. Optimal models are automatically selected.</p>
                  </div>

                  <Card className="bg-zinc-900/40 border-border/80 max-w-xl">
                    <CardHeader>
                      <CardTitle className="font-serif text-md text-primary">Configure LLM Integration</CardTitle>
                      <CardDescription>
                        State: {isLlmConfigured 
                          ? <span className="text-green-400 font-bold">Online & Configured</span> 
                          : <span className="text-orange-400 italic">Offline (Credentials missing)</span>
                        }
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSaveLlmSettings} className="space-y-5">
                        <div className="space-y-2">
                          <Label htmlFor="provider">LLM Provider</Label>
                          <Select name="provider" defaultValue={llmProvider} onValueChange={setLlmProvider}>
                            <SelectTrigger id="provider">
                              <SelectValue placeholder="Select LLM" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-border text-zinc-100">
                              <SelectItem value="gemini">Google Gemini (uses gemini-2.5-flash)</SelectItem>
                              <SelectItem value="openai">OpenAI (uses gpt-4o-mini)</SelectItem>
                              <SelectItem value="mistral">Mistral AI (uses mistral-small-latest)</SelectItem>
                              <SelectItem value="groq">Groq (uses llama3-8b-8192)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="api_key">API Key</Label>
                          <Input
                            id="api_key"
                            name="api_key"
                            type="password"
                            required
                            value={llmKey}
                            onChange={(e) => setLlmKey(e.target.value)}
                            placeholder="Paste your API key here..."
                          />
                        </div>

                        <Button type="submit" variant="luxe" className="w-full">
                          Save Settings
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* --- ABOUT US TAB (ADMIN ONLY) --- */}
              {activeTab === "about_us" && user.role === "master_admin" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div>
                    <h2 className="font-serif text-xl text-primary">Manage About Us Content</h2>
                    <p className="text-xs text-muted-foreground">Modify clinic sub-headings, taglines, description paragraphs, and cover images dynamically.</p>
                  </div>

                  <Card className="bg-zinc-900/40 border-border/80 max-w-2xl">
                    <CardHeader>
                      <CardTitle className="font-serif text-md text-primary">Clinic Story Settings</CardTitle>
                      <CardDescription>Update text paragraphs and reception images displayed on the public About page.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSaveAboutInfo} className="space-y-5">
                        <div className="space-y-2">
                          <Label htmlFor="intro">Intro Subtitle</Label>
                          <Input
                            id="intro"
                            name="intro"
                            required
                            value={aboutIntro}
                            onChange={(e) => setAboutIntro(e.target.value)}
                            placeholder="e.g. Chennai's First Ever Korean Aesthetics"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tagline">Clinic Tagline</Label>
                          <Input
                            id="tagline"
                            name="tagline"
                            required
                            value={aboutTagline}
                            onChange={(e) => setAboutTagline(e.target.value)}
                            placeholder="e.g. Transforming skin, beauty and wellness with authentic Korean care"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="paragraphs">About Us Paragraphs (One paragraph per line / double enter to separate)</Label>
                          <textarea
                            id="paragraphs"
                            name="paragraphs"
                            required
                            rows={8}
                            value={aboutParagraphs}
                            onChange={(e) => setAboutParagraphs(e.target.value)}
                            placeholder="Type each paragraph here. Separated by double enters..."
                            className="w-full rounded border border-border/80 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 focus:border-primary/50 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="about_image_file">Clinic Cover Image (Upload new to change or keep blank)</Label>
                          <Input
                            id="about_image_file"
                            name="about_image_file"
                            type="file"
                            className="cursor-pointer"
                          />
                          {aboutImageUrl && (
                            <p className="text-[0.65rem] text-zinc-400 mt-1 truncate">Current Image URL: <a href={aboutImageUrl} target="_blank" rel="noreferrer" className="text-primary underline">{aboutImageUrl}</a></p>
                          )}
                        </div>

                        <Button type="submit" variant="luxe" className="w-full" disabled={savingAbout}>
                          {savingAbout ? "Saving Changes..." : "Save About Us Content"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* --- FEEDBACK TAB --- */}
              {activeTab === "feedback" && hasAccess("feedback") && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div>
                    <h2 className="font-serif text-xl text-primary">Client Feedback & Complaints</h2>
                    <p className="text-xs text-muted-foreground">Review complaints and feedbacks submitted by clients and write replies.</p>
                  </div>

                  <Card className="bg-zinc-900/40 border-border/80">
                    <CardContent className="space-y-4 p-6">
                      {feedbacks.length === 0 ? (
                        <p className="text-zinc-500 text-sm">No feedbacks submitted.</p>
                      ) : (
                        feedbacks.map((f) => (
                          <div key={f.id} className="border border-border/60 bg-zinc-950 p-5 rounded-lg space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <span className={`text-[0.65rem] uppercase tracking-wider px-2 py-0.5 rounded mr-3 ${
                                  f.type === "complaint" ? "bg-red-500/10 border border-red-500/20 text-red-400" : "bg-primary/10 border border-primary/20 text-primary"
                                }`}>
                                  {f.type}
                                </span>
                                <span className="font-medium text-zinc-100">{f.client_name}</span>
                                <span className="text-[0.7rem] text-zinc-500 ml-2">({f.client_email})</span>
                              </div>
                              <span className="text-[0.65rem] text-zinc-500">{f.created_at}</span>
                            </div>
                            <p className="text-xs text-zinc-300 font-light leading-relaxed">{f.details}</p>
                            
                            {f.response ? (
                              <div className="bg-zinc-900/60 border-l-2 border-primary/60 p-3 text-xs space-y-1 rounded-r">
                                <span className="text-primary font-medium block">Replied on {f.responded_at}:</span>
                                <p className="text-zinc-400 italic font-light">{f.response}</p>
                              </div>
                            ) : (
                              user.role === "master_admin" && (
                                <Button onClick={() => {
                                  setReplyingFeedback(f);
                                  setFeedbackReplyText("");
                                }} variant="luxeOutline" size="xs">
                                  Write Reply
                                </Button>
                              )
                            )}
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* --- CONTENT CONFIG TAB --- */}
              {activeTab === "content" && user.role === "master_admin" && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  
                  {/* Service treatments */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                      <h3 className="font-serif text-lg text-primary">Manage Services</h3>
                      <Button onClick={() => setShowAddService(true)} variant="luxe" size="xs"><Plus className="size-3 mr-1" /> Add Service</Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {services.map((s) => (
                        <div key={s.id} className="border border-border/60 bg-zinc-950 p-4 rounded flex justify-between gap-4">
                          <div className="space-y-1">
                            <span className="text-[0.6rem] uppercase tracking-wider text-primary font-medium block">{s.category || "Skin Rejuvenation and Resurfacing"}</span>
                            <h4 className="text-sm font-medium text-zinc-100 mt-0.5">{s.name}</h4>
                            <p className="text-[0.7rem] text-zinc-400 line-clamp-2 mt-1">{s.description}</p>
                          </div>
                          <div className="flex gap-2.5 items-start shrink-0">
                            <button onClick={() => setEditingService(s)} className="text-zinc-400 hover:text-zinc-100 transition-colors" type="button"><Edit className="size-4" /></button>
                            <button onClick={() => handleDeleteItem("/api/content/services", s.id)} className="text-red-500 hover:text-red-400 transition-colors" type="button"><Trash2 className="size-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Offers management */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                      <h3 className="font-serif text-lg text-primary">Manage Offers</h3>
                      <Button onClick={() => setShowAddOffer(true)} variant="luxe" size="xs"><Plus className="size-3 mr-1" /> Add Offer</Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {offers.map((o) => (
                        <div key={o.id} className="border border-border/60 bg-zinc-950 p-4 rounded flex justify-between gap-4">
                          <div className="space-y-1.5">
                            <span className="text-[0.65rem] uppercase tracking-wider text-primary">{o.special ? "Special" : "Normal"} Offer</span>
                            <h4 className="text-sm font-medium text-zinc-100">{o.title} - {o.discount}</h4>
                            <p className="text-[0.7rem] text-zinc-400 line-clamp-2">{o.description}</p>
                            <span className="text-[0.65rem] text-zinc-500 block">Valid: {o.start_date} to {o.end_date}</span>
                          </div>
                          <button onClick={() => handleDeleteItem("/api/content/offers", o.id)} className="text-red-500 hover:text-red-400"><Trash2 className="size-4" /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Locations management */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                      <h3 className="font-serif text-lg text-primary">Manage Branch Locations</h3>
                      <Button onClick={() => setShowAddLocation(true)} variant="luxe" size="xs"><Plus className="size-3 mr-1" /> Add Location</Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {locations.map((l) => (
                        <div key={l.id} className="border border-border/60 bg-zinc-950 p-4 rounded flex justify-between gap-4">
                          <div className="space-y-1">
                            <h4 className="text-sm font-medium text-zinc-100">{l.name}</h4>
                            <p className="text-[0.7rem] text-zinc-400">{l.address}</p>
                          </div>
                          <button onClick={() => handleDeleteItem("/api/content/locations", l.id)} className="text-red-500 hover:text-red-400"><Trash2 className="size-4" /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Testimonial logs */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                      <h3 className="font-serif text-lg text-primary">Manage Testimonials</h3>
                      <Button onClick={() => setShowAddTestimonial(true)} variant="luxe" size="xs"><Plus className="size-3 mr-1" /> Add Testimonial</Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {testimonials.map((t) => (
                        <div key={t.id} className="border border-border/60 bg-zinc-950 p-4 rounded flex justify-between gap-4">
                          <div className="space-y-1">
                            <span className="text-[0.65rem] uppercase tracking-wider text-primary">{t.type}</span>
                            <h4 className="text-sm font-medium text-zinc-100">{t.author}</h4>
                            {t.text && <p className="text-[0.7rem] text-zinc-400 italic line-clamp-2">"{t.text}"</p>}
                          </div>
                          <button onClick={() => handleDeleteItem("/api/content/testimonials", t.id)} className="text-red-500 hover:text-red-400"><Trash2 className="size-4" /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </main>
          </div>
        )}
      </div>

      {/* --- MODALS & FORM DIALOGS --- */}

      {/* 1. Add Staff Modal */}
      {showAddStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-2xl relative">
            <h3 className="font-serif text-lg text-primary mb-4">Register New Staff</h3>
            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" required placeholder="Staff Name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required placeholder="email@aglow.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Initial Password</Label>
                <Input id="password" name="password" type="password" required placeholder="••••••••" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="role">Role</Label>
                <Select name="role" defaultValue="staff">
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Front Office (Staff)</SelectItem>
                    <SelectItem value="master_admin">Master Admin / Founder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" onClick={() => setShowAddStaff(false)} variant="ghost" size="sm">Cancel</Button>
                <Button type="submit" variant="luxe" size="sm">Create Account</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Client Modal */}
      {showAddClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-2xl relative text-zinc-100">
            <button
              onClick={() => setShowAddClient(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 rounded-full p-1 transition-colors"
              type="button"
              aria-label="Close modal"
            >
              <X className="size-4" />
            </button>
            <h3 className="font-serif text-lg text-primary mb-2">Register Client</h3>
            <p className="text-[0.65rem] text-zinc-500 mb-4">
              Initial password will be seeded as the **last 5 digits of their mobile phone number** and emailed to them.
            </p>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="client_id">Client ID</Label>
                <Input id="client_id" name="client_id" required placeholder="e.g. AG9821" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="name">Client Name</Label>
                <Input id="name" name="name" required placeholder="Full Name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mobile_no">Mobile Number</Label>
                <Input id="mobile_no" name="mobile_no" type="tel" required placeholder="e.g. 9994390069" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" name="age" type="number" required placeholder="Age" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" required placeholder="City / Area" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email ID</Label>
                <Input id="email" name="email" type="email" required placeholder="client@example.com" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" onClick={() => setShowAddClient(false)} variant="ghost" size="sm">Cancel</Button>
                <Button type="submit" variant="luxe" size="sm">Register</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Log History Modal */}
      {showAddHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-2xl relative text-zinc-100">
            <button
              onClick={() => setShowAddHistory(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 rounded-full p-1 transition-colors"
              type="button"
              aria-label="Close modal"
            >
              <X className="size-4" />
            </button>
            <h3 className="font-serif text-lg text-primary mb-4">Record Service Log</h3>
            <form onSubmit={handleCreateHistory} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="client_user_id">Select Client</Label>
                <Select name="client_user_id" required>
                  <SelectTrigger id="client_user_id">
                    <SelectValue placeholder="Choose client" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name} ({c.client_id})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="service_name">Treatment Taken</Label>
                <Select name="service_name" required>
                  <SelectTrigger id="service_name">
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {services.map(s => (
                      <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="date">Treatment Date</Label>
                  <Input id="date" name="date" type="date" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input id="price" name="price" type="number" required placeholder="Amount" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invoice_file">Upload Invoice File</Label>
                <Input id="invoice_file" name="invoice_file" type="file" className="cursor-pointer" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">Clinical Notes</Label>
                <Input id="notes" name="notes" placeholder="Remarks..." />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" onClick={() => setShowAddHistory(false)} variant="ghost" size="sm">Cancel</Button>
                <Button type="submit" variant="luxe" size="sm">Log Record</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Schedule Session Modal */}
      {showAddSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-2xl relative text-zinc-100">
            <button
              onClick={() => setShowAddSession(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 rounded-full p-1 transition-colors"
              type="button"
              aria-label="Close modal"
            >
              <X className="size-4" />
            </button>
            <h3 className="font-serif text-lg text-primary mb-4">Schedule Session</h3>
            <form onSubmit={handleCreateSessions} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="client_user_id">Select Client</Label>
                <Select name="client_user_id" required>
                  <SelectTrigger id="client_user_id">
                    <SelectValue placeholder="Choose client" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name} ({c.client_id})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="service_name">Service</Label>
                <Select name="service_name" required>
                  <SelectTrigger id="service_name">
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {services.map(s => (
                      <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="date">Session Date</Label>
                  <Input id="date" name="date" type="date" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="time">Time slot</Label>
                  <Input id="time" name="time" type="time" required />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" onClick={() => setShowAddSession(false)} variant="ghost" size="sm">Cancel</Button>
                <Button type="submit" variant="luxe" size="sm">Schedule</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Add Service Modal */}
      {showAddService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-2xl relative text-zinc-100">
            <button
              onClick={() => setShowAddService(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 rounded-full p-1 transition-colors"
              type="button"
              aria-label="Close modal"
            >
              <X className="size-4" />
            </button>
            <h3 className="font-serif text-lg text-primary mb-4">Add Skin Treatment</h3>
            <form onSubmit={handleCreateService} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Treatment Name</Label>
                <Input id="name" name="name" required placeholder="Service name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <Select name="category" defaultValue="Skin Rejuvenation and Resurfacing">
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Skin Rejuvenation and Resurfacing">Skin Rejuvenation and Resurfacing</SelectItem>
                    <SelectItem value="Energy Based Skin Tightening and Lifting">Energy Based Skin Tightening and Lifting</SelectItem>
                    <SelectItem value="Hair and Regenerative Therapies">Hair and Regenerative Therapies</SelectItem>
                    <SelectItem value="IV Nutrient Infusions">IV Nutrient Infusions</SelectItem>
                    <SelectItem value="Injectables and Anti Aging">Injectables and Anti Aging (Strictly by doctors)</SelectItem>
                    <SelectItem value="Lasers">Lasers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <textarea id="description" name="description" rows={3} placeholder="Service description..." className="w-full rounded border border-border/80 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 focus:border-primary/50 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="image_file">Cover Image File</Label>
                <Input id="image_file" name="image_file" type="file" className="cursor-pointer" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" onClick={() => setShowAddService(false)} variant="ghost" size="sm">Cancel</Button>
                <Button type="submit" variant="luxe" size="sm">Create</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Add Offer Modal */}
      {showAddOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-2xl relative text-zinc-100">
            <button
              onClick={() => setShowAddOffer(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 rounded-full p-1 transition-colors"
              type="button"
              aria-label="Close modal"
            >
              <X className="size-4" />
            </button>
            <h3 className="font-serif text-lg text-primary mb-4">Create Promotion Offer</h3>
            <form onSubmit={handleCreateOffer} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Offer Title</Label>
                <Input id="title" name="title" required placeholder="Promotion header" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="discount">Discount Value</Label>
                  <Input id="discount" name="discount" required placeholder="e.g. 20% OFF or ₹1,000 Off" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="promo_code">Promo Code</Label>
                  <Input id="promo_code" name="promo_code" placeholder="AGLOW20" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Details</Label>
                <Input id="description" name="description" required placeholder="Brief description of eligibility..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input id="start_date" name="start_date" type="date" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input id="end_date" name="end_date" type="date" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="special">Offer Tier</Label>
                <Select name="special" defaultValue="false">
                  <SelectTrigger id="special">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Normal Offer</SelectItem>
                    <SelectItem value="true">Special Pinned Offer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" onClick={() => setShowAddOffer(false)} variant="ghost" size="sm">Cancel</Button>
                <Button type="submit" variant="luxe" size="sm">Launch & Email Notify</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Add Location Modal */}
      {showAddLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-2xl relative text-zinc-100">
            <button
              onClick={() => setShowAddLocation(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 rounded-full p-1 transition-colors"
              type="button"
              aria-label="Close modal"
            >
              <X className="size-4" />
            </button>
            <h3 className="font-serif text-lg text-primary mb-4">Add Branch Location</h3>
            <form onSubmit={handleCreateLocation} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Branch Name</Label>
                <Input id="name" name="name" required placeholder="Puzhuthivakkam Branch" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address">Full Address</Label>
                <Input id="address" name="address" required placeholder="Branch coordinates details..." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="google_maps_iframe_url">Google Maps Embed link (src url)</Label>
                <Input id="google_maps_iframe_url" name="google_maps_iframe_url" required placeholder="https://www.google.com/maps/embed?pb=..." />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" onClick={() => setShowAddLocation(false)} variant="ghost" size="sm">Cancel</Button>
                <Button type="submit" variant="luxe" size="sm">Create</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Add Testimonial Modal */}
      {showAddTestimonial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-2xl relative text-zinc-100">
            <button
              onClick={() => setShowAddTestimonial(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 rounded-full p-1 transition-colors"
              type="button"
              aria-label="Close modal"
            >
              <X className="size-4" />
            </button>
            <h3 className="font-serif text-lg text-primary mb-4">Add Client Testimonial</h3>
            <form onSubmit={handleCreateTestimonial} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="author">Author Name</Label>
                  <Input id="author" name="author" required placeholder="Client name" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="treatment">Treatment Taken</Label>
                  <Input id="treatment" name="treatment" placeholder="Glass Facial" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="type">Testimonial Type</Label>
                <Select name="type" defaultValue="text_image">
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text_image">Written text with Image</SelectItem>
                    <SelectItem value="instagram">Instagram post link</SelectItem>
                    <SelectItem value="youtube">Youtube video link</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="text">Testimonial quote</Label>
                <textarea id="text" name="text" rows={2} placeholder="Client statement..." className="w-full rounded border border-border/80 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 focus:border-primary/50 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="content_url">Embed/Post URL</Label>
                  <Input id="content_url" name="content_url" placeholder="https://..." />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="image_file">Client Image File</Label>
                  <Input id="image_file" name="image_file" type="file" className="cursor-pointer" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" onClick={() => setShowAddTestimonial(false)} variant="ghost" size="sm">Cancel</Button>
                <Button type="submit" variant="luxe" size="sm">Add Record</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Feedback Reply Modal */}
      {replyingFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-2xl relative text-zinc-100">
            <button
              onClick={() => setReplyingFeedback(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 rounded-full p-1 transition-colors"
              type="button"
              aria-label="Close modal"
            >
              <X className="size-4" />
            </button>
            <h3 className="font-serif text-lg text-primary mb-2">Reply to Client</h3>
            <p className="text-xs text-muted-foreground mb-4">Writing resolution response for client {replyingFeedback.client_name}.</p>
            <form onSubmit={handleReplyFeedback} className="space-y-4">
              <div className="bg-zinc-900/60 p-3 rounded text-xs text-zinc-300 font-light border border-zinc-900 mb-2">
                <strong>Original Message:</strong>
                <p className="mt-1">{replyingFeedback.details}</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reply-text">Your response</Label>
                <textarea
                  id="reply-text"
                  required
                  rows={4}
                  value={feedbackReplyText}
                  onChange={(e) => setFeedbackReplyText(e.target.value)}
                  placeholder="Dear client, thank you for your input..."
                  className="w-full rounded border border-border/80 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 focus:border-primary/50 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" onClick={() => setReplyingFeedback(null)} variant="ghost" size="sm">Cancel</Button>
                <Button type="submit" variant="luxe" size="sm">Send Reply</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. Admin Reset Password Modal */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-2xl relative text-zinc-100">
            <button
              onClick={() => setResettingUser(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 rounded-full p-1 transition-colors"
              type="button"
              aria-label="Close modal"
            >
              <X className="size-4" />
            </button>
            <h3 className="font-serif text-lg text-primary mb-2">Reset User Password</h3>
            <p className="text-xs text-muted-foreground mb-4">Update credentials for user <strong>{resettingUser.name}</strong> ({resettingUser.email}) directly.</p>
            <form onSubmit={handleAdminResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="admin-new-password">New Password</Label>
                <Input
                  id="admin-new-password"
                  type="password"
                  required
                  value={adminNewPassword}
                  onChange={(e) => setAdminNewPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" onClick={() => setResettingUser(null)} variant="ghost" size="sm">Cancel</Button>
                <Button type="submit" variant="luxe" size="sm">Update Password</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 11. Edit Service Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-2xl relative text-zinc-100">
            <button
              onClick={() => setEditingService(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 rounded-full p-1 transition-colors"
              type="button"
              aria-label="Close modal"
            >
              <X className="size-4" />
            </button>
            <h3 className="font-serif text-lg text-primary mb-4">Edit Skin Treatment</h3>
            <form onSubmit={handleUpdateService} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Treatment Name</Label>
                <Input id="name" name="name" required defaultValue={editingService.name} placeholder="Service name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <Select name="category" defaultValue={editingService.category || "Skin Rejuvenation and Resurfacing"}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Skin Rejuvenation and Resurfacing">Skin Rejuvenation and Resurfacing</SelectItem>
                    <SelectItem value="Energy Based Skin Tightening and Lifting">Energy Based Skin Tightening and Lifting</SelectItem>
                    <SelectItem value="Hair and Regenerative Therapies">Hair and Regenerative Therapies</SelectItem>
                    <SelectItem value="IV Nutrient Infusions">IV Nutrient Infusions</SelectItem>
                    <SelectItem value="Injectables and Anti Aging">Injectables and Anti Aging (Strictly by doctors)</SelectItem>
                    <SelectItem value="Lasers">Lasers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={editingService.description}
                  placeholder="Service description..."
                  className="w-full rounded border border-border/80 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 focus:border-primary/50 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="image_file">Cover Image File (Optional - Leave blank to keep current)</Label>
                <Input id="image_file" name="image_file" type="file" className="cursor-pointer" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" onClick={() => setEditingService(null)} variant="ghost" size="sm">Cancel</Button>
                <Button type="submit" variant="luxe" size="sm">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 12. Edit Client Modal */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-2xl relative text-zinc-100">
            <button
              onClick={() => setEditingClient(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 rounded-full p-1 transition-colors"
              type="button"
              aria-label="Close modal"
            >
              <X className="size-4" />
            </button>
            <h3 className="font-serif text-lg text-primary mb-4">Edit Client Details</h3>
            <form onSubmit={handleUpdateClient} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="client_id">Client ID</Label>
                <Input id="client_id" name="client_id" required defaultValue={editingClient.client_id || ""} placeholder="e.g. AGL001" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" required defaultValue={editingClient.name} placeholder="Client name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" required defaultValue={editingClient.email} placeholder="client@example.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mobile_no">Mobile Number</Label>
                <Input id="mobile_no" name="mobile_no" required defaultValue={editingClient.mobile_no || ""} placeholder="Mobile number" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="age">Age</Label>
                <Input id="age" name="age" type="number" required defaultValue={editingClient.age || ""} placeholder="Client age" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location">Location / Branch</Label>
                <Input id="location" name="location" required defaultValue={editingClient.location || ""} placeholder="Location e.g. Chennai" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" onClick={() => setEditingClient(null)} variant="ghost" size="sm">Cancel</Button>
                <Button type="submit" variant="luxe" size="sm">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
