import { parseISO, format } from "date-fns";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import {
  ProgressBar,
  Badge,
  Button,
  Nav,
  Table,
  Row,
  Col,
  Pagination,
} from "react-bootstrap";
import { patchType } from "../api/api";
import { DATA_TYPES } from "../App";
import { formatDays } from "../shared/util";
import { TodosModal } from "./TodosModal";
import { formatDistanceStrict } from "date-fns";
const selectStyles = {
  control: (styles) => ({
    ...styles,
    backgroundColor: "#16191c",
    color: "white",
  }),
  multiValueLabel: (styles) => ({
    ...styles,
    backgroundColor: "#2a2c30",
    color: "white",
  }),
  multiValueRemove: (styles) => ({
    ...styles,
    backgroundColor: "#2a2c30",
    color: "white",
  }),
  singleValue: (styles) => ({ ...styles, color: "white" }),
  option: (styles, { isFocused, isSelected }) => {
    return {
      ...styles,
      backgroundColor: isFocused
        ? "#52525E"
        : isSelected
        ? "#000000"
        : "#16191c",
    };
  },
};
export const Todos = ({
  todos,
  todoTodos,
  projects,
  tags,
  selectedTags,
  setSelectedTags,
  selectedProjectId,
  setSelectedProjectId,
  refreshTodoTodos,
  refreshTodos,
}) => {
  const [editingTodo, setEditingTodo] = useState();
  const [activeTodoStatus, setActiveTodoStatus] = useState("WIP");
  const [currentPage, setCurrentPage] = useState(1);
  const setPage = (index) => setCurrentPage(index);

  /* Always refetch todos on mount */
  useEffect(() => refreshTodos(), []);

  const completeTodo = (todo) =>
    new Date().getDate() >= new Date(todo.start_date).getDate()
      ? patchType(
          { ...todo, completed_date: format(new Date(), "yyyy-MM-dd") },
          DATA_TYPES.TODOS
        ).then(() => {
          setTimeout(() => {
            alert("Done!");
          }, 1000);
          refreshTodos();
          refreshTodoTodos();
        })
      : window.alert(
          `Completed date cannot be before start date. Please edit start/completed date.`
        );

  const startTodo = (todo) =>
    patchType(
      { ...todo, start_date: format(new Date(), "yyyy-MM-dd") },
      DATA_TYPES.TODOS
    ).then(refreshTodos);

  // Filter list selection by tag if a tag was selected from autocomplete field,
  // or if no tag was selected, show everything
  let filteredProjects =
    selectedTags.length > 0
      ? projects.filter((project) =>
          project.tags.some((tag) => selectedTags.includes(tag))
        )
      : projects;

  // Filter todos based on selected project
  // or if no selected project, filter todos based on selected tags
  // else show all todos
  let filteredTodos = selectedProjectId
    ? todoTodos.filter((todo) => todo.project === selectedProjectId)
    : selectedTags.length > 0
    ? todoTodos.filter((todo) =>
        todo.tags.some((tag) => selectedTags.includes(tag))
      )
    : todoTodos;

  // Sort todos based on descending completed_date, ascending due_date and start_date
  filteredTodos = filteredTodos.sort(
    (a, b) =>
      new Date(b.completed_date) - new Date(a.completed_date) ||
      new Date(a.due_date) - new Date(b.due_date) ||
      new Date(a.start_date) - new Date(b.start_date)
  );
  let doneTodos = todos.filter((todo) => todo.completed_date);
  let filteredDoneTodos = selectedProjectId
    ? doneTodos.filter((todo) => todo.project === selectedProjectId)
    : selectedTags.length > 0
    ? doneTodos.filter((todo) =>
        todo.tags.some((tag) => selectedTags.includes(tag))
      )
    : doneTodos;

  let doingTodos = filteredTodos.filter(
    (todo) =>
      // not completed AND
      !todo.completed_date &&
      // started OR
      ((todo.start_date && parseISO(todo.start_date) <= new Date()) ||
        // not started but due
        (!todo.start_date &&
          todo.due_date &&
          parseISO(todo.due_date) <= new Date()))
  );
  let startingTodos = filteredTodos.filter(
    (todo) =>
      // not completed AND
      !todo.completed_date &&
      // not started AND
      todo.due_date &&
      (!todo.start_date || parseISO(todo.start_date)) > new Date() &&
      // not due
      todo.start_date &&
      (!todo.due_date || parseISO(todo.due_date) > new Date())
  );

  let planningTodos = filteredTodos.filter(
    (todo) => !todo.completed_date && !todo.start_date && !todo.due_date
  );

  const earnedRewards = filteredDoneTodos.reduce(
    (acc, todo) => acc + parseFloat(todo.reward),
    0
  );
  const toEarnRewards =
    planningTodos.reduce((acc, todo) => acc + parseFloat(todo.reward), 0) +
    startingTodos.reduce((acc, todo) => acc + parseFloat(todo.reward), 0) +
    doingTodos.reduce((acc, todo) => acc + parseFloat(todo.reward), 0);

  const filteredStatusTodos = {
    KIV: planningTodos,
    Starting: startingTodos,
    WIP: doingTodos,
    Done: filteredDoneTodos,
  };

  const pageSize = 20;
  let pageCount = Math.ceil(
    filteredStatusTodos[activeTodoStatus].length / pageSize
  );

  const records = filteredStatusTodos[activeTodoStatus]
    .slice((currentPage - 1) * pageSize, currentPage * pageSize)
    .map((todo) => {
      const formattedStartDueComplete = todo.completed_date
        ? formatDistanceStrict(
            parseISO(todo.completed_date),
            parseISO(todo.start_date),
            { roundingMethod: "ceil", unit: "day" }
          )
        : !todo.start_date || !todo.due_date
        ? ""
        : new Date() > parseISO(todo.start_date)
        ? formatDays(todo.due_date).concat(
            " (",
            format(parseISO(todo.due_date), "d MMM"),
            ")"
          )
        : formatDays(todo.start_date).concat(
            " (",
            format(parseISO(todo.start_date), "d MMM"),
            ")"
          );

      const isOverdue = new Date() > parseISO(todo.due_date);

      return (
        <tr
          key={todo.id}
          style={{
            backgroundColor: todo.project && "#212529",
          }}
        >
          <td
            onClick={() => setEditingTodo(todo)}
            style={{
              cursor: "pointer",
            }}
          >
            <span className="subtitle">
              {projects.find((project) => project.id === todo.project)?.title}{" "}
            </span>
            <span>{todo.title} </span>
            {todo.frequency && (
              <Badge bg="dark" text="light">
                ({todo.frequency})
              </Badge>
            )}
          </td>
          {!todo.completed_date && (
            <td>
              <b style={{ fontSize: "80%" }}>
                ${parseFloat(todo.reward).toFixed(1)}
              </b>
              {parseFloat(todo.effort) < 1 ? (
                <Badge bg="dark"> for {todo.effort * 60} min</Badge>
              ) : (
                <Badge bg="dark">
                  {" "}
                  for {parseFloat(todo.effort).toFixed(1)} hrs
                </Badge>
              )}
            </td>
          )}
          <td
            style={{
              textAlign: "right",
            }}
          >
            <b
              style={{
                fontSize: "80%",
                color: isOverdue && !todo.completed_date ? "#d15c38" : "white",
              }}
            >
              {formattedStartDueComplete != "0 days" &&
                formattedStartDueComplete}{" "}
            </b>
            {!todo.completed_date ? (
              ""
            ) :  (
              <b style={{ fontSize: "80%" }}>
                {format(parseISO(todo.completed_date), "d MMM")}
              </b>
            )}
          </td>
          <td
            style={{
              textAlign: "right",
            }}
          >
            {todo.completed_date ? (
              <span>Earned ${todo.reward}</span>
            ) : todo.start_date && parseISO(todo.start_date) < new Date() ? (
              <Button
                className="py-0"
                variant="success"
                onClick={() => {
                  completeTodo(todo);
                }}
              >
                Done
              </Button>
            ) : (
              <Button
                className="py-0"
                variant="success"
                onClick={() => {
                  startTodo(todo);
                }}
              >
                Start
              </Button>
            )}
          </td>
        </tr>
      );
    });

  return (
    <>
      {editingTodo && (
        <TodosModal
          projects={projects}
          refreshTodos={refreshTodos}
          refreshTodoTodos={refreshTodoTodos}
          setTodo={setEditingTodo}
          todo={editingTodo}
          tags={tags}
        />
      )}
      <Row className="my-4">
        <Col xs="auto">
          <Button
            onClick={() =>
              setEditingTodo({ project: selectedProjectId, tags: selectedTags })
            }
          >
            New todo
          </Button>
        </Col>
        <Col>
          <Select
            value={tags
              .filter((tag) => selectedTags?.includes(tag.id))
              .map((filteredTag) => ({
                value: filteredTag.id,
                label: filteredTag.title,
              }))}
            name="tags"
            placeholder="All Tags"
            isMulti
            isSearchable={false}
            styles={selectStyles}
            options={tags.map((tag) => ({ value: tag.id, label: tag.title }))}
            onChange={(e) => {
              setSelectedTags(e.map((tag) => tag.value));
            }}
          />
        </Col>
        <Col>
          <Select
            name="projects"
            placeholder="All Projects"
            isClearable
            isSearchable={false}
            styles={selectStyles}
            options={filteredProjects.map((project) => ({
              value: project.id,
              label: project.title,
            }))}
            defaultValue={{
              value: selectedProjectId,
              label: projects.find(
                (project) => project.id === selectedProjectId
              )
                ? projects.find((project) => project.id === selectedProjectId)
                    .title
                : "All Projects",
            }}
            onChange={(project) =>
              setSelectedProjectId(project ? project.value : "")
            }
          />
        </Col>
      </Row>
      <ProgressBar className="my-4">
        <ProgressBar
          variant="success"
          now={100 * (toEarnRewards / (toEarnRewards + earnedRewards)) + 1}
          label={`$${toEarnRewards.toFixed(1)} to earn`}
        />
        <ProgressBar
          style={{ backgroundColor: "#064b35" }}
          now={100 * (earnedRewards / (toEarnRewards + earnedRewards))}
          label={`$${earnedRewards.toFixed(1)} earned`}
          key={2}
        />
      </ProgressBar>
      <Nav fill variant="tabs">
        <Nav.Item>
          <Nav.Link
            className={activeTodoStatus == "KIV" ? "active" : ""}
            onClick={() => {
              setActiveTodoStatus("KIV");
              setPage(1);
            }}
          >
            KIV ({planningTodos.length})
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            className={activeTodoStatus == "Starting" ? "active" : ""}
            onClick={() => {
              setActiveTodoStatus("Starting");
              setPage(1);
            }}
          >
            Starting ({startingTodos.length})
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            className={activeTodoStatus == "WIP" ? "active" : ""}
            onClick={() => {
              setActiveTodoStatus("WIP");
              setPage(1);
            }}
          >
            WIP ({doingTodos.length})
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            className={activeTodoStatus == "Done" ? "active" : ""}
            onClick={() => {
              setActiveTodoStatus("Done");
              setPage(1);
            }}
          >
            Done ({filteredDoneTodos.length})
          </Nav.Link>
        </Nav.Item>
      </Nav>
      <Table hover responsive="md" variant="dark">
        <thead>
          {activeTodoStatus == "KIV" ? (
            <tr>
              <th>Todo</th>
              <th>Effort</th>
              <th></th>
              <th></th>
            </tr>
          ) : activeTodoStatus == "Starting" ? (
            <tr>
              <th>Todo</th>
              <th>Effort</th>
              <th style={{ textAlign: "right" }}>Start</th>
              <th></th>
            </tr>
          ) : activeTodoStatus == "WIP" ? (
            <tr>
              <th>Todo</th>
              <th>Effort</th>
              <th style={{ textAlign: "right" }}>Due</th>
              <th></th>
            </tr>
          ) : (
            <tr>
              <th>Todo</th>
              <th style={{ textAlign: "right" }}>Done</th>
              <th></th>
            </tr>
          )}
        </thead>
        <tbody>{records}</tbody>
      </Table>
      {pageCount > 1 && (
        <Pagination>
          {currentPage > 1 && (
            <Pagination.Item key={1} onClick={() => setPage(1)}>
              {1}
            </Pagination.Item>
          )}
          {currentPage > 3 && (
            <Pagination.Ellipsis
              onClick={() => setPage(Math.ceil(currentPage / 2))}
            />
          )}
          {currentPage > 2 && (
            <Pagination.Item
              key={currentPage - 1}
              onClick={() => setPage(currentPage - 1)}
            >
              {currentPage - 1}
            </Pagination.Item>
          )}
          <Pagination.Item active key={currentPage}>
            {currentPage}
          </Pagination.Item>
          {currentPage < pageCount - 2 && (
            <Pagination.Item
              key={currentPage + 1}
              onClick={() => setPage(currentPage + 1)}
            >
              {currentPage + 1}
            </Pagination.Item>
          )}
          {currentPage < pageCount - 2 && (
            <Pagination.Ellipsis
              onClick={() =>
                setPage(currentPage + Math.ceil((pageCount - currentPage) / 2))
              }
            />
          )}

          {currentPage < pageCount && (
            <Pagination.Item key={pageCount} onClick={() => setPage(pageCount)}>
              {pageCount}
            </Pagination.Item>
          )}
        </Pagination>
      )}
    </>
  );
};
