import React, { useCallback, useEffect, useState } from "react";
import { Container, Nav, Navbar, Button } from "react-bootstrap";

import { getType, getCSRF, getLogout } from "./api/api";

import { LoginModal } from "./login/LoginModal";
import { Projects } from "./projects/Projects";
import { Tags } from "./tags/Tags";
import { Todos } from "./todos/Todos";
import { Wishlist } from "./wishlist/Wishlist";

export const API_ROOT = "";

/* Enum of data types and their display values
This allows us to reference them as DATA_TYPES.[type],
which prevents errors from typos happening further down.*/
export const DATA_TYPES = {
  TODOS: {
    displayName: "Todos",
    apiName: "todos",
  },
  TODOTODOS: {
    displayName: "Todos",
    apiName: "todos?wip=true",
  },
  PROJECTS: {
    displayName: "Projects",
    apiName: "projects",
  },
  WISHLIST: {
    displayName: "Wishlist",
    apiName: "wishlist",
  },
  TAGS: {
    displayName: "Tags",
    apiName: "tags",
  },
};

export const App = () => {
  const [activeDataType, setActiveDataType] = useState(
    DATA_TYPES.TODOS.displayName
  );

  const [tags, setTags] = useState([]);
  const [projects, setProjects] = useState([]);
  const [todos, setTodos] = useState([]);
  const [todoTodos, setTodoTodos] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

  const [loggingIn, setLoggingIn] = useState();

  const refreshTags = useCallback(
    () => void getType(DATA_TYPES.TAGS).then((json) => setTags(json)),
    []
  );

  const refreshProjects = useCallback(
    () => void getType(DATA_TYPES.PROJECTS).then((json) => setProjects(json)),
    []
  );
  const refreshTodos = useCallback(
    () => void getType(DATA_TYPES.TODOS).then((json) => setTodos(json)),
    []
  );

  const refreshTodoTodos = useCallback(
    () => void getType(DATA_TYPES.TODOTODOS).then((json) => setTodoTodos(json)),
    []
  );

  const refreshWishlist = useCallback(
    () => void getType(DATA_TYPES.WISHLIST).then((json) => setWishlist(json)),
    []
  );

  const onLogout = () =>
    getLogout().then(() => {
      setTags([]);
      setProjects([]);
      setTodos([]);
      setWishlist([]);
    });

  useEffect(() => {
    getCSRF();
    refreshTags();
    refreshProjects();
    refreshTodos();
    refreshTodoTodos();
    refreshWishlist();
  }, []);

  const viewTodosFromProjectId = (projectId) => {
    setSelectedProjectId(projectId);
    setActiveDataType("Todos");
  };
  const viewTodosFromTags = (tagId) => {
    setSelectedTags([tagId]);
    setActiveDataType("Todos");
  };
  const viewProjectsFromTags = (tagId) => {
    setSelectedTags([tagId]);
    setActiveDataType("Projects");
  };
  // totalRewards and claimedRewards will be recalculated every render
  // It's not expensive, hence they're not memoized
  const totalRewards = todos
    .filter((todo) => todo.completed_date)
    .reduce((acc, todo) => acc + parseFloat(todo.reward), 0);

  const views = {
    [DATA_TYPES.TAGS.displayName]: (
      <Tags
        tags={tags}
        projects={projects}
        todos={todos}
        refreshTags={refreshTags}
        viewTodosFromTags={viewTodosFromTags}
        viewProjectsFromTags={viewProjectsFromTags}
      />
    ),

    [DATA_TYPES.TODOS.displayName]: (
      <Todos
        todos={todos}
        todoTodos={todoTodos}
        refreshTodos={refreshTodos}
        refreshTodoTodos={refreshTodoTodos}
        projects={projects}
        tags={tags}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId}
      />
    ),

    [DATA_TYPES.PROJECTS.displayName]: (
      <Projects
        projects={projects}
        tags={tags}
        todos={todos}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        refreshProjects={refreshProjects}
        viewTodosFromProjectId={viewTodosFromProjectId}
      />
    ),

    [DATA_TYPES.WISHLIST.displayName]: (
      <Wishlist
        totalRewards={totalRewards}
        refreshWishlist={refreshWishlist}
        wishlist={wishlist}
      />
    ),
  };

  return (
    <div>
      {loggingIn && (
        <LoginModal
          refreshWishlist={refreshWishlist}
          refreshProjects={refreshProjects}
          refreshTodos={refreshTodos}
          refreshTags={refreshTags}
          setLoggingIn={setLoggingIn}
        />
      )}
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand>Todhay</Navbar.Brand>
          <Nav variant="tabs" className="me-auto">
            <Nav.Link
              key="Todos"
              className={activeDataType == "Todos" ? "active" : ""}
              onClick={() => setActiveDataType("Todos")}
            >
              Todos
            </Nav.Link>
            <Nav.Link
              key="Projects"
              className={activeDataType == "Projects" ? "active" : ""}
              onClick={() => setActiveDataType("Projects")}
            >
              Projects
            </Nav.Link>
            <Nav.Link
              key="Wishlist"
              className={activeDataType == "Wishlist" ? "active" : ""}
              onClick={() => setActiveDataType("Wishlist")}
            >
              Wishlist
            </Nav.Link>
            <Nav.Link
              key="Tags"
              className={activeDataType == "Tags" ? "active" : ""}
              onClick={() => setActiveDataType("Tags")}
            >
              Tags
            </Nav.Link>
          </Nav>
          <Navbar.Text
            style={{ color: "white" }}
            className="justify-content-end"
          >
            {todos.length > 0 ? (
              <Button variant="outline-light" onClick={onLogout}>
                Logout
              </Button>
            ) : (
              <Button onClick={() => setLoggingIn(true)}>Login</Button>
            )}
          </Navbar.Text>
        </Container>
      </Navbar>
      <Container>
        {/* We display the appropriate view based on activeDataType*/}
        {views[activeDataType]}
      </Container>
    </div>
  );
};
