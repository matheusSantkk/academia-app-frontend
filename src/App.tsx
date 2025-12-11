import { useState } from "react";
import type { UserData } from "./types";

// Telas
import LoginScreen from "./screens/LoginScreen";
import RankingScreen from "./screens/RankingScreen";
import SettingsScreen from "./screens/SettingsScreen";

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
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null
  );

  // Tema agora é gerenciado pelo ThemeProvider (useTheme) — removido o estado local

  const handleLogin = (userData: UserData) => {
    setUser(userData);
    setActiveTab("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab("dashboard");
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const renderContent = () => {
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
          return <SettingsScreen user={user} />;
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
    switch (activeTab) {
      case "workouts":
        return <WorkoutsListScreen user={user} />;
      case "achievements":
        return <AchievementsScreen user={user} />;
      case "ranking":
        return <RankingScreen />;
      case "settings":
        return <SettingsScreen user={user} />;
      default:
        return <StudentDashboard user={user} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="relative">
      {renderContent()}

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
