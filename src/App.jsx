import { BrowserRouter, Link, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import Welcome from './pages/Welcome.jsx'
import Introduction from './pages/Introduction.jsx'
import GetStarted from './pages/GetStarted.jsx'
import SignUp from './pages/SignUp.jsx'
import SignIn from './pages/SignIn.jsx'
import Home from './pages/Home.jsx'
import MySkills from './pages/MySkills.jsx'
import MyRoadmap from './pages/MyRoadmap.jsx'
import Lesson from './pages/Lesson.jsx'
import CreateRoadmap from './pages/CreateRoadmap.jsx'
import EditLesson from './pages/EditLesson.jsx'
import BrowseRoadmaps from './pages/BrowseRoadmaps.jsx'
import Roadmap from './pages/Roadmap.jsx'
import BrowseLessons from './pages/BrowseLessons.jsx'
import Notifications from './pages/Notifications.jsx'
import Profile from './pages/Profile.jsx'
import BrowseProjects from './pages/BrowseProjects.jsx'
import Project from './pages/Project.jsx'
import EditProject from './pages/EditProject.jsx'

function Layout() {
  return (
    <>
      <Outlet />
      <nav aria-label="Main navigation">
        <Link to="/profile">Profile</Link>
        <Link to="/notifications">Notifications</Link>
        <Link to="/my-skills">My skills</Link>
        <Link to="/home">Home</Link>
      </nav>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <main>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/introduction" element={<Introduction />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route element={<Layout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/my-skills" element={<MySkills />} />
            <Route path="/my-roadmap">
              <Route index element={<MyRoadmap />} />
              <Route path="lesson" element={<Lesson />} />
            </Route>
            <Route path="/create-roadmap" element={<CreateRoadmap />} />
            <Route path="/edit-lesson" element={<EditLesson />} />
            <Route path="/browse-roadmaps" element={<BrowseRoadmaps />} />
            <Route path="/roadmap">
              <Route index element={<Roadmap />} />
              <Route path="lesson" element={<Lesson />} />
            </Route>
            <Route path="/browse-lessons" element={<BrowseLessons />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/projects">
              <Route index element={<BrowseProjects />} />
              <Route path="public" element={<BrowseProjects isPublic />} />
              <Route path="new" element={<EditProject />} />
              <Route path=":projectId" element={<Project />} />
              <Route path=":projectId/edit" element={<EditProject />} />
              <Route path="public/:projectId" element={<Project isPublic />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
