import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
// Temporary placeholder data — replace with real API calls when each page is wired up
const courses = [];
const labs = [];
const grades = [];
const quizQuestions = [];
const assignments = [];
const activities = [];
// src/services/api.js  (new file)
const BASE = 'http://localhost:8000/api'; // Django dev server

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Request failed');
  return res.json();
}

const Icon = ({ children }) => <span className="icon" aria-hidden="true">{children}</span>;
const navItems = [
  ['dashboard', '▦', 'Dashboard'], ['courses', '▤', 'My Courses'], ['labs', '◈', 'Daily Labs'],
  ['assignments', '▱', 'Assignments'], ['grades', '★', 'Grades & Feedback'], ['progress', '◴', 'My Progress']
];

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('dashboard');
  useEffect(() => {
  const token = localStorage.getItem('codepath_token');

  if (!token) return;

  fetch('http://localhost:8000/api/auth/me/', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(response => response.json())
    .then(data => {
      if (data.user) {
        setUser(data.user);
        setPage(data.user.role === 'student' ? 'dashboard' : data.user.role);
      } else {
        localStorage.removeItem('codepath_token');
      }
    })
    .catch(() => {
      localStorage.removeItem('codepath_token');
    });
}, []);
 const [activeCourse, setActiveCourse] = useState(null);
  const [toast, setToast] = useState('');
  const notify = (message) => { setToast(message); setTimeout(() => setToast(''), 2800); };
  const openCourse = (course) => { setActiveCourse(course); setPage('course'); };
  const signIn = (loggedInUser) => {
  setUser(loggedInUser);
  setPage(loggedInUser.role === 'student' ? 'dashboard' : loggedInUser.role);
};
  if (!user) return <AuthScreen onSignIn={signIn} />;
  const renderPage = () => {
  const props = { setPage, openCourse, activeCourse, notify, user };
  if (page === 'dashboard') return <Dashboard {...props} />;
  if (page === 'courses') return <Courses {...props} />;
  if (page === 'course') return <CourseDetails {...props} />;
    if (page === 'lesson') return <Lesson {...props} />;
    if (page === 'editor') return <Editor {...props} />;
    if (page === 'labs') return <Labs {...props} />;
    if (page === 'quiz') return <Quiz {...props} />;
    if (page === 'assignments') return <Assignments {...props} />;
    if (page === 'grades') return <Grades />;
    if (page === 'progress') return <Progress />;
    return <PortalShell role={page} />;
  };
  return <div className="app-shell">
    <aside className="sidebar"><div className="brand"><span>&lt;/&gt;</span>CodePath</div><p className="portal-label">STUDENT PORTAL</p>
      <nav>{navItems.map(([key, icon, label]) => <button className={page === key ? 'nav active' : 'nav'} onClick={() => setPage(key)} key={key}><Icon>{icon}</Icon>{label}</button>)}</nav>
      <div className="sidebar-bottom"><p className="portal-label">DEMO PORTALS</p><button className="nav" onClick={() => setPage('instructor')}><Icon>♙</Icon>Instructor view</button><button className="nav" onClick={() => setPage('admin')}><Icon>⚙</Icon>Administrator view</button><div className="student-card"><div className="avatar">{user.name.split(' ').map(n=>n[0]).join('')}</div><div><strong>{user.name}</strong><small>{user.role}</small></div><button className="logout" title="Log out" onClick={() => setUser(null)}>↪</button></div></div>
    </aside>
    <main><header className="topbar"><button className="mobile-menu">☰</button><div className="search">⌕ <span>Search courses, lessons, or labs...</span></div><div className="top-actions"><button>◌</button><button className="notification">♧<i></i></button><div className="avatar small">AM</div></div></header><section className="content">{renderPage()}</section></main>
    {toast && <div className="toast">✓ {toast}</div>}
  </div>;
}

function AuthScreen({ onSignIn }) {
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const labels = {
    student: 'Student',
    instructor: 'Instructor',
    admin: 'Administrator'
  };

    const handleSubmit = async () => {
    if (mode === 'login') {
      const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();   

      localStorage.setItem('codepath_token', data.token);
      onSignIn(data.user);
      return;
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
      }
      if (password.length < 8) {
        alert('Password must contain at least 8 characters.');
        return;
      }

      const response = await fetch('http://localhost:8000/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          phone,
          gender,
          country,
          city,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || 'Registration failed.');
        return;
      }

      localStorage.setItem('codepath_token', data.token);
      onSignIn(data.user);
      return;
    }

    if (mode === 'forgot') {
      const response = await fetch('http://localhost:8000/api/auth/forgot-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || 'Something went wrong.');
        return;
      }

      let msg = data.message;
      if (data.reset_link) {
        msg += `\n\n(Dev link: ${data.reset_link})`;
      }
      setResetMessage(msg);
      return;
    }
  };

     
  return (
    <main className="auth-page">

      <div className="auth-brand">
        <div className="brand">
          <span>&lt;/&gt;</span>
          CodePath
        </div>
        <p>Learn. Practice. Build.</p>
      </div>

      <section className="auth-form-wrap">
        <div className="auth-form">

          <div className="auth-switch">
            <button
              className={mode === 'login' ? 'chosen' : ''}
              onClick={() => setMode('login')}
            >
              Log in
            </button>

            <button
              className={mode === 'signup' ? 'chosen' : ''}
              onClick={() => setMode('signup')}
            >
              Create account
            </button>
          </div>

          <div className="auth-heading">
            <p className="eyebrow">
              {mode === 'login' ? 'WELCOME BACK' : 'START LEARNING'}
            </p>

            <h2>
              {mode === 'login'
                ? 'Welcome back to CodePath'
                : 'Create your CodePath account'}
            </h2>

            <p className="auth-subtitle">
              {mode === 'login'
                ? 'Continue where you left off and keep building your skills.'
                : 'Set up your account and start your learning journey.'}
            </p>
          </div>

          {mode === 'signup' && (
            <label>
              Full name
              <input
                type="text"
                placeholder="e.g. Alex Morgan"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </label>
          )}

         {mode !== 'forgot' && (
  <>
    <label>
      Email address
      <input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
    </label>

    <label>
      Password
      <input
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
    </label>

    {mode === 'login' && (
      <p style={{ textAlign: 'right', marginTop: -6, marginBottom: 10 }}>
        <button
          type="button"
          onClick={() => setMode('forgot')}
          style={{
            border: 0,
            background: 'transparent',
            color: '#335cff',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Forgot password?
        </button>
      </p>
    )}

    {mode === 'signup' && (
      <label>
        Confirm password
        <input
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
        />
      </label>
    )}

    {mode === 'signup' && (
      <label>
        Phone number
        <input
          type="tel"
          placeholder="+254 700 000 000"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
      </label>
    )}

    {mode === 'signup' && (
      <label>
        Gender
        <select value={gender} onChange={e => setGender(e.target.value)}>
          <option value="">Prefer not to say</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </label>
    )}

    {mode === 'signup' && (
      <>
        <label>
          Country
          <input
            type="text"
            placeholder="Kenya"
            value={country}
            onChange={e => setCountry(e.target.value)}
          />
        </label>
        <label>
          City
          <input
            type="text"
            placeholder="Nairobi"
            value={city}
            onChange={e => setCity(e.target.value)}
          />
        </label>
      </>
    )}
  </>
)}

{mode === 'forgot' && (
  <>
    <label>
      Email address
      <input
        type="email"
        placeholder="you@example.com"
        value={forgotEmail}
        onChange={e => setForgotEmail(e.target.value)}
      />
    </label>
    {resetMessage && (
      <p style={{ color: '#335cff', fontSize: 13, whiteSpace: 'pre-wrap' }}>
        {resetMessage}
      </p>
    )}
  </>
)}

          {mode === 'signup' && (
            <>
              <span className="role-label">
                I am joining as a
              </span>

              <div className="role-select">
                {Object.entries(labels).map(([key, label]) => (
                  <button
                    type="button"
                    onClick={() => setRole(key)}
                    className={role === key ? 'role-chosen' : ''}
                    key={key}
                  >
                    <b>
                      {key === 'student'
                        ? '◉'
                        : key === 'instructor'
                        ? '♙'
                        : '⚙'}
                    </b>
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}

          <button className="primary auth-submit" onClick={handleSubmit}>
  {mode === 'login' ? 'Log in' : mode === 'signup' ? 'Create account' : 'Send reset link'} →
</button>

          <p className="auth-footer">
  {mode === 'login' && (<>Don't have an account? <button type="button" onClick={() => setMode('signup')}>Create one</button></>)}
  {mode === 'signup' && (<>Already have an account? <button type="button" onClick={() => setMode('login')}>Log in</button></>)}
  {mode === 'forgot' && (<>Remembered it? <button type="button" onClick={() => setMode('login')}>Back to login</button></>)}
</p>

        </div>
      </section>

      <p className="auth-bottom">
        Learn. Practice. Build.
      </p>

    </main>
  );
}                 


function Dashboard({ openCourse, setPage, user }) {
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('codepath_token');
    fetch('http://localhost:8000/api/activity/', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setActivities(data.activities || []))
      .catch(console.error);

    fetch('http://localhost:8000/api/dashboard/stats/', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, []);

  return <>
    <div className="welcome">
      <div>
        <p className="eyebrow">YOUR LEARNING SPACE</p>
        <h1>Good morning, {user.name} <span>👋</span></h1>
        <p>Keep building your skills, one challenge at a time.</p>
      </div>

      
  <button className="primary" onClick={() => setPage('courses')}>
        Continue learning <span>→</span>
      </button>
    </div>

    <section className="stats">
  <Stat
    value={stats?.enrolled_courses_count ?? '–'}
    label="Enrolled courses"
    icon="▤"
    color="blue"
  />
  <Stat
    value={stats?.total_lessons_count ?? '–'}
    label="Lessons available"
    icon="✓"
    color="green"
  />
  <Stat value="0" label="Labs completed" icon="◈" color="purple"/>
  <Stat value="–" label="Average score" icon="↗" color="orange"/>
</section>

    {stats?.latest_enrollment ? (
  <section className="learning-hero">
    <div className="learning-hero-content">
      <div>
        <p className="eyebrow">CURRENT LEARNING PATH</p>
        <span className="pill blue">IN PROGRESS</span>

        <h2>{stats.latest_enrollment.course_title}</h2>

        <p>{stats.latest_enrollment.course_description || 'Keep building your skills.'}</p>

        <div className="path-progress">
          <div>
            <span>{stats.latest_enrollment.level}</span>
            <strong>{stats.latest_enrollment.progress_percent}%</strong>
          </div>
          <div className="progressbar">
            <i style={{ width: `${stats.latest_enrollment.progress_percent}%` }}></i>
          </div>
        </div>

        <button className="primary" onClick={() => setPage('courses')}>
          Resume learning →
        </button>
      </div>

      <div className="code-preview">
        <div className="code-top">
          <span></span><span></span><span></span>
        </div>
        <pre>{`const learner = {
  name: "${user.name}",
  course: "${stats.latest_enrollment.course_title}",
  progress: ${stats.latest_enrollment.progress_percent}
};

console.log("Keep going!");`}</pre>
      </div>
    </div>
  </section>
) : (
  <section className="learning-hero">
    <div className="learning-hero-content">
      <div>
        <p className="eyebrow">GET STARTED</p>
        <h2>You're not enrolled in a course yet</h2>
        <p>Browse the library and enroll to start learning.</p>
        <button className="primary" onClick={() => setPage('courses')}>
          Browse courses →
        </button>
      </div>
    </div>
  </section>
)}

    <section className="learning-grid">

      <div className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">TODAY</p>
            <h2>Your learning plan</h2>
          </div>
          <span className="pill">2 of 4 complete</span>
        </div>

        {[
          'Watch: Variables and declarations',
          'Practice: Variable naming challenge',
          'Daily lab: Build a tip calculator',
          'Quiz: JavaScript basics'
        ].map((x, i) => (
          <label className="task" key={x}>
            <input type="checkbox" defaultChecked={i < 2}/>
            <span>{x}</span>
            {i === 2 && <b>20 min</b>}
          </label>
        ))}
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">ACTIVITY</p>
            <h2>Recent activity</h2>
          </div>

          <button
            className="link"
            onClick={() => setPage('progress')}
          >
            View all
          </button>
        </div>
        {activities.length === 0 && (
        <p style={{ color: '#8d99ad', fontSize: 13 }}>
          No recent activity yet. Enroll in a course to get started.
        </p>
      )}

        {activities.slice(0, 3).map(a => (
          <div className="activity-row" key={a.title}>
            <div className={'activity-icon ' + a.type}>
              {a.icon}
            </div>

            <div>
              <strong>{a.title}</strong>
              <p>{a.detail}</p>
            </div>

            <span>{a.time}</span>
          </div>
        ))}
      </div>

    </section>

    <section className="panel deadlines-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">STAY ON TRACK</p>
          <h2>Upcoming deadlines</h2>
        </div>

        <button
          className="link"
          onClick={() => setPage('assignments')}
        >
          View all
        </button>
      </div>

      <div className="deadline-grid">
        <Deadline
          date="12"
          month="SEP"
          title="JavaScript Variables Quiz"
          meta="Quiz · 10 questions"
        />

        <Deadline
          date="14"
          month="SEP"
          title="Daily Lab: Tip Calculator"
          meta="Lab · Due in 4 days"
        />

        <Deadline
          date="18"
          month="SEP"
          title="Assignment: Profile Card"
          meta="Assignment · Due in 8 days"
        />
      </div>
    </section>
  </>
}
const Stat=({value,label,icon,color})=><div className="stat"><div className={'stat-icon '+color}>{icon}</div><div><strong>{value}</strong><span>{label}</span></div></div>;
const Deadline=({date,month,title,meta})=><div className="deadline"><div><b>{date}</b><small>{month}</small></div><p><strong>{title}</strong><span>{meta}</span></p></div>;

function Courses({ openCourse }) {
  const [dbCourses, setDbCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = () => {
    const token = localStorage.getItem('codepath_token');
    setLoading(true);
    fetch('http://localhost:8000/api/courses/', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => response.json())
      .then(data => {
        setDbCourses(data.courses || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleEnroll = async (courseId) => {
    const token = localStorage.getItem('codepath_token');
    await fetch(`http://localhost:8000/api/courses/${courseId}/enroll/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    fetchCourses(); // refresh list so is_enrolled updates
  };

  if (loading) return <p>Loading courses...</p>;

  return (
    <>
      <PageTitle
        eyebrow="LEARNING LIBRARY"
        title="My courses"
        text="Keep building your skills, one lesson at a time."
      />

      <div className="course-grid">
        {dbCourses.map(course => (
          <article className="course-card" key={course.id}>
            <div className={`course-banner ${course.level}`}>
              <span>{course.title.slice(0, 2).toUpperCase()}</span>
              <b>{course.level}</b>
            </div>

            <div className="course-card-body">
              <p className="eyebrow">
                {course.is_enrolled ? 'ENROLLED' : 'AVAILABLE'}
              </p>

              <h2>{course.title}</h2>

              <p>{course.description}</p>

              {course.is_enrolled ? (
                <>
                  <div className="progressbar">
                    <i style={{ width: '0%' }}></i>
                  </div>
                  <small>0% complete</small>
                  <button
                    className="outline"
                    onClick={() => openCourse(course)}
                  >
                    Start course →
                  </button>
                </>
              ) : (
                <button
                  className="primary"
                  onClick={() => handleEnroll(course.id)}
                  style={{ width: '100%' }}
                >
                  Enroll now
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
function CourseDetails({ activeCourse, setPage, notify }) {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!activeCourse?.id) {
      setError('No course selected.');
      setLoading(false);
      return;
    }
    const token = localStorage.getItem('codepath_token');
    fetch(`http://localhost:8000/api/courses/${activeCourse.id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => {
        if (!r.ok) throw new Error('Could not load course.');
        return r.json();
      })
      .then(data => {
        setCourse(data.course);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [activeCourse]);

  if (loading) return <p>Loading course...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!course) return null;

  const totalLessons = course.modules.reduce(
    (sum, m) => sum + (m.lessons?.length || 0),
    0
  );

  return (
    <>
      <button className="back" onClick={() => setPage('courses')}>
        ← Back to courses
      </button>

      <div className="course-hero">
        <div>
          <p className="eyebrow">
            {course.level?.toUpperCase() || 'COURSE'}
          </p>
          <h1>{course.title}</h1>
          <p>{course.description}</p>
          <div className="hero-meta">
            <span>◴ Self-paced</span>
            <span>▤ {totalLessons} lessons</span>
            <span>◈ {course.modules.length} modules</span>
          </div>
        </div>
      </div>

      <div className="section-heading">
        <div>
          <h2>Course content</h2>
          <p>Complete each module to unlock the next one.</p>
        </div>
        <button
          className="outline"
          onClick={() => notify('Course outline downloaded (demo)')}
        >
          ⇩ Download outline
        </button>
      </div>

      <div className="module-list">
        {course.modules.length === 0 && (
          <p>This course has no modules yet.</p>
        )}

        {course.modules.map((m, i) => (
          <div
            className={`module ${m.is_locked ? 'locked' : ''}`}
            key={m.id}
          >
            <div className="module-number">
              {m.is_locked ? '🔒' : i + 1}
            </div>

            <div className="module-main">
              <div>
                <p className="eyebrow">MODULE {m.order}</p>
                <h3>{m.title}</h3>
                <span>
                  {m.lessons?.length || 0} lessons
                  {m.lessons?.length
                    ? ` · ${m.lessons.reduce(
                        (s, l) => s + (l.duration_minutes || 0),
                        0
                      )} min`
                    : ''}
                  {m.is_completed && ' · ✅ Complete'}
                </span>
              </div>
            </div>

                        <div style={{ display: 'flex', gap: 8 }}>
              {!m.is_locked && !m.is_completed && (
                <button
                  className="outline"
                  style={{ padding: '6px 10px', fontSize: 12 }}
                  onClick={() => handleMarkComplete(m)}
                >
                  ✓ Mark complete
                </button>
              )}
              <button
                className={m.is_locked ? 'locked-btn' : 'round-arrow'}
                disabled={m.is_locked}
                onClick={() => {
                  if (m.is_locked) return;
                  setPage('lesson');
                }}
                title={
                  m.is_locked
                    ? 'Complete the previous module to unlock'
                    : 'Open module'
                }
              >
                {m.is_locked ? '🔒' : '→'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
  

function Lesson({setPage}) { return <><button className="back" onClick={()=>setPage('course')}>← JavaScript Fundamentals</button><div className="lesson-layout"><article className="lesson"><p className="eyebrow">MODULE 2 · LESSON 3</p><h1>Working with JavaScript Variables</h1><p className="lesson-lead">Learn how to store, update, and use data in a JavaScript program.</p><div className="video"><span>▶</span><p>Introduction to variables</p><small>12:48</small></div><h2>What is a variable?</h2><p>Variables are named containers for information. Think of them as labels you attach to a value so you can use it later in your program.</p><pre><code>let userName = 'Alex';<br/>const courseName = 'JavaScript Fundamentals';</code></pre><div className="callout"><b>💡 Quick tip</b><p>Use <code>const</code> when a value will not change, and <code>let</code> when it can.</p></div><div className="lesson-actions"><button className="outline" onClick={()=>setPage('course')}>← Previous</button><button className="primary" onClick={()=>setPage('editor')}>Try the exercise →</button></div></article><aside className="lesson-sidebar"><h3>Module 2: Variables & Data Types</h3>{['What are variables?','Declaring variables','Working with variables','Strings and numbers','Module quiz'].map((x,i)=><button onClick={()=>i===4&&setPage('quiz')} className={i===2?'current':i<2?'done':''} key={x}><span>{i<2?'✓':i+1}</span>{x}{i===2&&' ▶'}</button>)}</aside></div></>}
function Editor({notify,setPage}) { const [code,setCode]=useState("let name = 'Alex';\nlet language = 'JavaScript';\n\nconsole.log(`Hello, ${name}!`);"); return <><button className="back" onClick={()=>setPage('lesson')}>← Back to lesson</button><div className="exercise-head"><div><p className="eyebrow">CODING EXERCISE · MODULE 2</p><h1>Say hello with variables</h1><span className="pill green">● Beginner</span></div><div className="exercise-score">10 <small>points</small></div></div><div className="editor-layout"><article className="challenge"><h2>Your challenge</h2><p>Create two variables called <code>name</code> and <code>language</code>. Then print a welcome message using a template literal.</p><h3>Expected output</h3><pre><code>Hello, Alex! Welcome to JavaScript.</code></pre><h3>Helpful hints</h3><ul><li>Declare values with <code>let</code> or <code>const</code>.</li><li>Template literals use backticks, not quotation marks.</li></ul><div className="tests"><div><span>✓</span><b>Tests</b><small>2 of 3 passing</small></div><p>✓ Variables are declared</p><p>✓ Console output exists</p><p className="pending">○ Welcome message includes language</p></div></article><article className="code-area"><div className="code-toolbar"><span>JavaScript</span><button onClick={()=>notify('Code reset to starter template')}>↺ Reset</button></div><textarea value={code} spellCheck="false" onChange={e=>setCode(e.target.value)} /><div className="console"><div>CONSOLE OUTPUT <button onClick={()=>notify('Console cleared')}>Clear</button></div><p><span>›</span> Hello, Alex!</p></div><div className="editor-actions"><button className="outline" onClick={()=>notify('Running your JavaScript…')}>▶ Run code</button><button className="primary" onClick={()=>notify('Great work — exercise submitted!')}>Submit solution →</button></div></article></div></>}
function Labs({setPage,notify}) {
  const [labs, setLabs] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/activities/?type=lab', {
      headers: { Authorization: `Bearer ${localStorage.getItem('codepath_token')}` }
    })
      .then(r => r.json())
      .then(data => setLabs(data.activities || []))
      .catch(console.error);
  }, []);

  return <>
    <PageTitle
      eyebrow="PRACTICE EVERY DAY"
      title="Daily labs"
      text="Short, practical coding challenges to strengthen your skills."
    />

    <div className="lab-highlight">
      <div>
        <p className="eyebrow">TODAY'S LAB</p>
        <h2>Build a tip calculator</h2>
        <p>Use variables, arithmetic operators, and user input to calculate a restaurant tip.</p>
        <div>
          <span>◴ 20 min</span>
          <span>★ 20 points</span>
          <span>Beginner</span>
        </div>
      </div>
      <button className="primary" onClick={() => setPage('editor')}>
        Start today's lab →
      </button>
    </div>

    <div className="lab-list">
      {labs.length === 0 && (
        <p style={{ color: '#8d99ad', fontSize: 13 }}>
          No labs available yet. Check back soon.
        </p>
      )}

      {labs.map(l => (
        <div className="lab" key={l.id}>
          <div className="lab-date today">
            <b>{l.order}</b>
            <small>LAB</small>
          </div>
          <div>
            <h3>{l.title}</h3>
            <p>{l.description}</p>
            <span>★ {l.points} points · {l.module_title} · {l.course_title}</span>
          </div>
          <span className="pill open">
            {l.submission_count > 0 ? 'Submitted' : 'Available'}
          </span>
          <button className="round-arrow" onClick={() => setPage('editor')}>
            →
          </button>
        </div>
      ))}
    </div>
  </>;
}
function Quiz({notify,setPage}) { const [selected,setSelected]=useState({}); const [submitted,setSubmitted]=useState(false); return <><button className="back" onClick={()=>setPage('course')}>← JavaScript Fundamentals</button><div className="quiz-top"><div><p className="eyebrow">MODULE 2 ASSESSMENT</p><h1>Variables & Data Types Quiz</h1><p>Answer all questions. You need 70% to pass.</p></div><div className="timer">◴ 09:42</div></div>{quizQuestions.map((q,i)=><article className="question" key={q.question}><p><b>{i+1}.</b> {q.question}</p>{q.options.map(opt=><label className={selected[i]===opt?'selected':''} key={opt}><input type="radio" name={'q'+i} onChange={()=>setSelected({...selected,[i]:opt})}/>{opt}</label>)}</article>)}<div className="quiz-footer"><span>{Object.keys(selected).length} of {quizQuestions.length} answered</span><button className="primary" onClick={()=>{setSubmitted(true);notify('Quiz submitted — your result is 80%!')}}>Submit quiz</button></div>{submitted&&<div className="toast">✓ Quiz submitted — check Grades & Feedback</div>}</>}
function Assignments({notify}) {
  const [assignments, setAssignments] = useState([]);
  const [modalActivity, setModalActivity] = useState(null);
  const [viewSubmissionId, setViewSubmissionId] = useState(null);

  const loadAssignments = () => {
    fetch('http://localhost:8000/api/activities/?type=assignment', {
      headers: { Authorization: `Bearer ${localStorage.getItem('codepath_token')}` }
    })
      .then(r => r.json())
      .then(data => setAssignments(data.activities || []))
      .catch(console.error);
  };

  useEffect(() => { loadAssignments(); }, []);

  return (
    <>
      <PageTitle
        eyebrow="SHOW WHAT YOU KNOW"
        title="Assignments"
        text="Submit your work and receive feedback from your instructor."
      />

      <div className="assignment-list">
        {assignments.length === 0 && (
          <p style={{ color: '#8d99ad', fontSize: 13 }}>
            No assignments yet. Check back soon.
          </p>
        )}

        {assignments.map(a => (
          <article className="assignment" key={a.id}>
            <div className="assignment-icon open">☐</div>
            <div className="assignment-body">
              <div>
                <span className="pill open">
                  {a.submission_count > 0 ? 'submitted' : 'open'}
                </span>
                <h2>{a.title}</h2>
                <p>{a.description}</p>
                <small>
                  {a.points} points · {a.module_title} · {a.course_title}
                </small>
              </div>
              <div>
                <button
                  className={a.submission_count > 0 ? 'outline' : 'primary'}
                  onClick={() => {
                    if (a.submission_count > 0) {
                      setViewSubmissionId(a.id);
                    } else {
                      setModalActivity(a);
                    }
                  }}
                >
                  {a.submission_count > 0 ? 'View submission' : 'Submit assignment'} →
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {modalActivity && (
        <SubmitModal
          activity={modalActivity}
          onClose={() => setModalActivity(null)}
          onSubmitted={() => {
            notify('Submission saved!');
            loadAssignments();
          }}
        />
      )}

      {viewSubmissionId && (
        <SubmissionModal
          activityId={viewSubmissionId}
          onClose={() => setViewSubmissionId(null)}
        />
      )}
    </>
  );
}

function Grades(){return <><PageTitle eyebrow="YOUR PERFORMANCE" title="Grades & feedback" text="Review your results and use feedback to improve."/><section className="grade-summary"><div><span>Current average</span><strong>78%</strong><p>Keep it up! You are above the course average.</p></div><div className="grade-ring">78<small>%</small></div><div className="grade-breakdown"><p><span>Quizzes</span><b>82%</b></p><p><span>Labs</span><b>75%</b></p><p><span>Assignments</span><b>78%</b></p></div></section><div className="panel grade-table"><div className="panel-head"><h2>Recent results</h2><button className="link">Filter</button></div>{grades.map(g=><div className="grade-row" key={g.title}><div className="grade-type">{g.icon}</div><div><strong>{g.title}</strong><p>{g.date} · {g.category}</p></div><div className="feedback">“{g.feedback}”</div><b className={g.score<70?'low':''}>{g.score}%</b><button>→</button></div>)}</div></>}
function Progress(){return <><PageTitle eyebrow="LEARNING JOURNEY" title="My progress" text="See how far you have come and what to tackle next."/><div className="progress-overview"><div className="progress-circle"><strong>42%</strong><span>Overall progress</span></div><div><h2>You're making steady progress!</h2><p>Complete 3 more lessons to finish Module 2 and unlock the next module.</p><div className="streak">🔥 <b>5 day streak</b><span>Your longest streak: 12 days</span></div></div></div><div className="panel"><div className="panel-head"><h2>Course progress</h2><button className="link">See certificates</button></div>{courses.map(c=><div className="course-progress" key={c.id}><div className={'mini-mark '+c.theme}>{c.symbol}</div><div><strong>{c.title}</strong><div className="progressbar"><i style={{width:c.progress+'%'}}></i></div><small>{c.completed} of {c.lessons} lessons complete</small></div><b>{c.progress}%</b></div>)}</div></>}
function PortalShell({role}) { const isInstructor=role==='instructor';return <><PageTitle eyebrow={isInstructor?'INSTRUCTOR PORTAL':'ADMINISTRATOR PORTAL'} title={isInstructor?'Instructor dashboard':'Administrator dashboard'} text={isInstructor?'Manage courses, review learner work, and help students succeed.':'Monitor platform activity and manage the learning community.'}/><section className="stats">{(isInstructor?[['6','Active courses','▤','blue'],['84','Learners','♙','green'],['18','To review','▱','orange'],['91%','Completion rate','↗','purple']]:[['246','Students','♙','blue'],['12','Instructors','♜','green'],['18','Published courses','▤','purple'],['1,284','Enrollments','↗','orange']]).map(x=><Stat key={x[1]} value={x[0]} label={x[1]} icon={x[2]} color={x[3]}/>)}</section><div className="empty-shell"><div>{isInstructor?'✦':'⚙'}</div><h2>{isInstructor?'Teaching workspace ready':'Platform overview ready'}</h2><p>This presentation shell is ready for the next build phase: management tables, authoring tools, and reporting screens.</p><button className="primary">Explore {isInstructor?'courses':'users'} →</button></div></>}
const PageTitle=({eyebrow,title,text})=><div className="page-title"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{text}</p></div></div>;
function SubmissionModal({ activityId, onClose }) {
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
  const token = localStorage.getItem('codepath_token');
  fetch('http://localhost:8000/api/submissions/', {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(r => r.json())
    .then(data => {
      const subs = data.submissions || [];
      const found = subs.find(s => Number(s.activity) === Number(activityId));
      if (found) setSubmission(found);
      else setError('No submission found.');
      setLoading(false);
    })
    .catch(() => { setError('Network error.'); setLoading(false); });
}, [activityId]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Your submission</h2>

        {loading && <p>Loading…</p>}
        {error && <p style={{ color: 'crimson' }}>{error}</p>}

        {submission && (
          <>
            <p className="modal-sub">{submission.activity_title}</p>

            <label>Your answer / code</label>
            <pre style={{
  background: '#17223b',
  color: '#dce7ff',
  padding: 14,
  borderRadius: 6,
  whiteSpace: 'pre-wrap',
  fontSize: 13,
  lineHeight: 1.6,
  fontFamily: 'Consolas, Monaco, monospace',
  overflowX: 'auto',
}}>
  {submission.content || '(empty)'}
</pre>

            {submission.repo_url && (
              <p>
                <strong>Repo:</strong>{' '}
                <a href={submission.repo_url} target="_blank" rel="noreferrer">
                  {submission.repo_url}
                </a>
              </p>
            )}

            <p style={{ color: '#71809a', fontSize: 13 }}>
              Status: <strong>{submission.status}</strong><br />
              Submitted: {new Date(submission.submitted_at).toLocaleString()}
            </p>

            {submission.grade != null && (
              <p style={{
                background: '#e7f7ee',
                padding: 12,
                borderRadius: 6,
                color: '#17865a',
                fontWeight: 600,
              }}>
                Grade: {submission.grade}
              </p>
            )}

            {submission.feedback && (
              <p style={{
                background: '#f5f7fb',
                padding: 12,
                borderRadius: 6,
                fontSize: 13,
              }}>
                <strong>Feedback:</strong> {submission.feedback}
              </p>
            )}
          </>
        )}

        <div className="modal-actions">
          <button className="outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
function SubmitModal({ activity, onClose, onSubmitted }) {
  const [content, setContent] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError('Please enter your answer before submitting.');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('codepath_token');
      const res = await fetch(
        `http://localhost:8000/api/activities/${activity.id}/submit/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content, repo_url: repoUrl }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Submission failed.');
        setSubmitting(false);
        return;
      }

      onSubmitted();
      onClose();
    } catch (err) {
      setError('Network error — please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Submit: {activity.title}</h2>
        <p className="modal-sub">{activity.description}</p>

        <label>
          Your answer / code
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Paste your code or write your answer here..."
            rows={8}
          />
        </label>

        <label>
          GitHub repository URL (optional)
          <input
            type="url"
            value={repoUrl}
            onChange={e => setRepoUrl(e.target.value)}
            placeholder="https://github.com/you/repo"
          />
        </label>

        {error && <p style={{ color: 'crimson', fontSize: 13 }}>{error}</p>}

        <div className="modal-actions">
          <button className="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button className="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit →'}
          </button>
        </div>
      </div>
    </div>
  );
}
createRoot(document.getElementById('root')).render(<App />)

