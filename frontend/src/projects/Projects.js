import { format, parseISO } from "date-fns";
import React, { useState } from "react";
import { FcTodoList, FcClock, FcMoneyTransfer } from "react-icons/fc";
import {
  ProgressBar,
  Badge,
  Button,
  Card,
  Row,
  Col,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { formatDays } from "../shared/util";
import { ProjectModal } from "./ProjectModal";
import Select from "react-select";

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

export const Projects = ({
  projects,
  tags,
  todos,
  selectedTags,
  setSelectedTags,
  refreshProjects,
  viewTodosFromProjectId,
}) => {
  const [editingProject, setEditingProject] = useState();
  // Filter list selection by tag if a tag was selected from autocomplete field,
  // or if no tag was selected, filter list based on whether the list is a project (has a due date) or not
  let filteredProjects =
    selectedTags.length > 0
      ? projects.filter((project) =>
          project.tags.some((tag) => selectedTags.includes(tag))
        )
      : projects;

  // Sort list by due date
  filteredProjects = filteredProjects.sort(
    (a, b) => new Date(a.due_date) - new Date(b.due_date)
  );

  const cards = filteredProjects.map((project) => {
    const projectTodos = todos.filter((todo) => todo.project === project.id);
    // Only count completed todos in calculating effort and earnings
    const totalCompletedTodos = projectTodos.filter(
      (todo) => todo.completed_date
    );
    const totalCompletedEffort = totalCompletedTodos.reduce(
      (acc, todo) => acc + parseFloat(todo.effort),
      0
    );
    const totalCompletedRewards = totalCompletedTodos.reduce(
      (acc, todo) => acc + parseFloat(todo.reward),
      0
    );

    const totalPendingTodos = projectTodos.filter(
      (todo) => !todo.completed_date
    ).length;
    const totalPendingRewards = projectTodos
      .filter((todo) => !todo.completed_date)
      .reduce((acc, todo) => acc + parseFloat(todo.reward), 0);
    const totalPendingEffort = projectTodos
      .filter((todo) => !todo.completed_date)
      .reduce((acc, todo) => acc + parseFloat(todo.effort), 0);
    return (
      <Col key={project.id}>
        <Card key={project.id} text="white" bg="dark">
          <Card.Body
            style={{ cursor: "pointer" }}
            onClick={() => setEditingProject(project)}
          >
            <Card.Title tag="h5">
              {project.title}
              {" - "}
              {project.tags.map((id) => (
                <Badge
                  pill
                  key={id}
                  bg="dark"
                  text="light"
                  style={{ fontSize: "60%" }}
                >
                  {tags.find((tag) => tag.id === id).title}
                </Badge>
              ))}
            </Card.Title>
            <Card.Subtitle className="subtitle">
              {project.due_date &&
                `Due ${formatDays(project.due_date)} (${format(
                  parseISO(project.due_date),
                  "d MMM yy"
                )})`}
            </Card.Subtitle>
            <FcTodoList />
            <span>
              {" "}
              {totalCompletedTodos.length}/{projectTodos.length} todos completed
            </span>
            <ProgressBar
              variant="success"
              now={(100 * totalCompletedTodos.length) / projectTodos.length}
            />
            <FcMoneyTransfer />
            <span>
              {" "}
              ${totalCompletedRewards.toFixed(1)}/
              {(totalCompletedRewards + totalPendingRewards).toFixed(1)} earned
            </span>
            <ProgressBar
              variant="success"
              now={
                (100 * totalCompletedRewards) /
                (totalCompletedRewards + totalPendingRewards)
              }
            />
            <FcClock />
            <span>
              {" "}
              {totalCompletedEffort.toFixed(1)}/
              {(totalCompletedEffort + totalPendingEffort).toFixed(1)} hrs
              invested
            </span>
            <ProgressBar
              variant="success"
              now={
                (100 * totalCompletedEffort) /
                (totalCompletedEffort + totalPendingEffort)
              }
            />
          </Card.Body>
          <Card.Footer>
            <OverlayTrigger
              placement="right"
              overlay={
                <Tooltip id={project.id}>
                  ${totalPendingRewards} to be earned.
                </Tooltip>
              }
            >
              <Button
                variant="outline-light"
                onClick={(e) => {
                  e.stopPropagation();
                  viewTodosFromProjectId(project.id);
                }}
              >
                View todos ({totalPendingTodos})
              </Button>
            </OverlayTrigger>
          </Card.Footer>
        </Card>
      </Col>
    );
  });

  return (
    <>
      {editingProject && (
        <ProjectModal
          project={editingProject}
          setProject={setEditingProject}
          tags={tags}
          refreshProjects={refreshProjects}
        />
      )}
      <Row className="my-4">
        <Col xs="auto">
          <Button onClick={() => setEditingProject({})}>New project</Button>
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
            styles={selectStyles}
            options={tags.map((tag) => ({ value: tag.id, label: tag.title }))}
            onChange={(e) => {
              setSelectedTags(e.map((tag) => tag.value));
            }}
          />
        </Col>
      </Row>
      <Row xs={1} md={2} lg={3} className="g-3">
        {cards}
      </Row>
    </>
  );
};
