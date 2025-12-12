import { useState, useEffect } from "react";
import type { UserData } from "./types";
import { api } from "./api";

// Telas
import WelcomeScreen from "./screens/WelcomeScreen";
import LoginTeacherScreen from "./screens/LoginTeacherScreen";
import LoginStudentScreen from "./screens/LoginStudentScreen";
import RankingScreen from "./screens/RankingScreen";
import SettingsScreen from "./screens/SettingsScreen";
import ChangePasswordScreen from "./screens/ChangePasswordScreen";

// Componentes comuns
import BottomNav from "./components/common/BottomNav";

// Componentes do Aluno
import StudentDashboard from "./components/student/StudentDashboard";
import WorkoutsListScreen from "./components/student/WorkoutsListScreen";
import AchievementsScreen from "./components/student/AchievementsScreen";

// Componentes do Professor
import TeacherDashboard from "./components/teacher/TeacherDashboard";
import StudentDetailScreen from "./components/teacher/StudentDetailScreen";
import CreateTrainingScreen from "./components/teacher/CreateTrainingScreen";
import CreateStudentScreen from "./components/teacher/CreateStudentScreen";
import StudentsListScreen from "./components/teacher/StudentsListScreen";

export default function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loginType, setLoginType] = useState<"welcome" | "teacher" | "student">("welcome");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null
  );

  const handleLogin = (userData: UserData) => {
    console.log("[App] handleLogin chamado com:", userData);
    setUser(userData);
    setLoginType("welcome");
    setActiveTab("dashboard");
  };

  const handlePasswordChanged = async () => {
    // Recarregar dados do usuário para atualizar needsPasswordChange
    if (user) {
      // Fazer login novamente para atualizar o token e dados
      // Por enquanto, apenas atualizar o flag localmente
      setUser({ ...user, needsPasswordChange: false });
      setActiveTab("dashboard"); // Garantir que volta para o dashboard
    }
  };

  const handleUserDataUpdate = async () => {
    // Atualizar dados do usuário (XP, level) após completar treino
    if (user && user.role === "student") {
      try {
        const memberData = await api.getMemberData(user.id);
        setUser({
          ...user,
          points: memberData.xp,
          level: memberData.level,
          streak: memberData.currentStreak,
        });
      } catch (error) {
        console.error("[App] Erro ao atualizar dados do usuário:", error);
      }
    }
  };

  // Garantir que quando o usuário é aluno e não precisa trocar senha, o activeTab seja "dashboard"
  useEffect(() => {
    if (user && user.role === "student" && !user.needsPasswordChange && activeTab !== "dashboard" && activeTab !== "workouts" && activeTab !== "achievements" && activeTab !== "ranking" && activeTab !== "settings") {
      console.log("[App] Ajustando activeTab para dashboard para aluno");
      setActiveTab("dashboard");
    }
  }, [user, activeTab]);

  const handleLogout = () => {
    setUser(null);
    setLoginType("welcome");
    setActiveTab("dashboard");
  };

  // Tela de login
  if (!user) {
    if (loginType === "welcome") {
      return <WelcomeScreen onSelectType={(type) => setLoginType(type === "teacher" ? "teacher" : "student")} />;
    }
    if (loginType === "teacher") {
      return <LoginTeacherScreen onLogin={handleLogin} onBack={() => setLoginType("welcome")} />;
    }
    if (loginType === "student") {
      return <LoginStudentScreen onLogin={handleLogin} onBack={() => setLoginType("welcome")} />;
    }
    return null;
  }

  console.log("[App] Usuário logado:", { role: user.role, needsPasswordChange: user.needsPasswordChange, activeTab });

  // Se o usuário precisa trocar a senha (primeiro login de aluno)
  if (user.role === "student" && user.needsPasswordChange) {
    console.log("[App] Redirecionando para ChangePasswordScreen");
    return (
      <ChangePasswordScreen
        user={{ id: user.id, name: user.name, email: user.email }}
        onPasswordChanged={handlePasswordChanged}
      />
    );
  }

  const renderContent = () => {
    if (!user) return null;
    
    console.log("[App] renderContent - role:", user.role, "activeTab:", activeTab);
    
    if (user.role === "teacher") {
      switch (activeTab) {
        case "create-student":
          return (
            <CreateStudentScreen
              setActiveTab={setActiveTab}
              setSelectedStudentId={setSelectedStudentId}
            />
          );

        case "create-training":
          return (
            <CreateTrainingScreen
              setActiveTab={setActiveTab}
              selectedStudentId={selectedStudentId}
              setSelectedStudentId={setSelectedStudentId}
            />
          );

        case "students":
        case "students-list":
          return (
            <StudentsListScreen
              setActiveTab={setActiveTab}
              setSelectedStudentId={setSelectedStudentId}
            />
          );

        case "student-detail":
          return (
            <StudentDetailScreen
              studentId={selectedStudentId}
              setActiveTab={setActiveTab}
              setSelectedStudentId={setSelectedStudentId}
            />
          );

        case "ranking":
          return <RankingScreen />;

        case "settings":
          return <SettingsScreen user={user} onLogout={handleLogout} />;

        default:
          return (
            <TeacherDashboard
              setActiveTab={setActiveTab}
              setSelectedStudentId={setSelectedStudentId}
            />
          );
      }
    }

    // Aluno
    if (user.role === "student") {
      console.log("[App] Renderizando conteúdo para aluno, activeTab:", activeTab);
      switch (activeTab) {
        case "workouts":
          return <WorkoutsListScreen user={user} onUserDataUpdate={handleUserDataUpdate} />;

        case "achievements":
          return <AchievementsScreen user={user} onUserDataUpdate={handleUserDataUpdate} />;

        case "ranking":
          return <RankingScreen />;

        case "settings":
          return <SettingsScreen user={user} onLogout={handleLogout} />;

        default:
          return <StudentDashboard user={user} setActiveTab={setActiveTab} onUserDataUpdate={handleUserDataUpdate} />;
      }
    }
    
    // Se chegou aqui e não é teacher nem student, retornar null
    console.warn("[App] Role desconhecido:", user.role);
    return null;
  };

  const content = renderContent();
  
  if (!content) {
    console.error("[App] renderContent retornou null para user:", user);
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Erro ao carregar conteúdo</p>
          <p className="text-slate-400">Role: {user.role}</p>
          <p className="text-slate-400">ActiveTab: {activeTab}</p>
          <button
            onClick={handleLogout}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {content}

      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        role={user.role}
      />

      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs hover:bg-slate-600 z-50"
      >
        Sair
      </button>
    </div>
  );
}
