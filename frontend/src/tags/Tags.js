import { useState } from "react";
import React from "react";
import { FcClock, FcMoneyTransfer } from "react-icons/fc";
import { Button, Card, Row, Col } from "react-bootstrap";
import { TagsModal } from "./TagsModal";

export const Tags = ({ tags, projects, todos, refreshTags, viewProjectsFromTags, viewTodosFromTags }) => {
  const [editingTag, setEditingTag] = useState();

  // Sort tags by topic, title
  tags = tags.sort(
    (a, b) =>
      a.topic - b.topic ||
      a.title - b.title
  );

  const cards = tags.map((tag) => {
    const projectsWithTag = projects.filter((project) => project.tags.includes(tag.id));
    const numProjects = projectsWithTag.length;

    const todosWithTag = todos.filter((todo) => todo.tags.includes(tag.id));
    const numTodos = todosWithTag.length;
    const totalRewards = todosWithTag.reduce((acc, todo) => acc + parseFloat(todo.reward), 0);
    const totalEffort = todosWithTag.reduce((acc, todo) => acc + parseFloat(todo.effort), 0);

    // const numPendingTodos = todos.filter((todo) =>
    //   !todo.completed_date && projectsWithTag.map((project) => project.id).includes(todo.project)
    // ).length;

    return (
      <Col key={tag.id}>
        <Card
          onClick={() => setEditingTag(tag)}
          bg="dark"
          text="white"
          style={{ cursor: "pointer" }}
        >
          <Card.Body>
            <Card.Header as="h5">{tag.title}</Card.Header>
            <Card.Text>
              <Row><Col>
                <Button disabled className = "my-1" variant="dark" style={{ width: "100%" }} >
                <FcMoneyTransfer /> ${totalRewards.toFixed(1)}
                  </Button>
                  </Col><Col>
                  <Button disabled className = "my-1"  variant="dark" style={{ width: "100%" }} >
                  <FcClock /> {totalEffort.toFixed(1)} hrs
                  </Button>
                  </Col>
                  </Row>
                  <Row><Col>
                {numTodos > 0 &&
                  <Button className = "my-1"  variant="outline-light" style={{ width: "100%" }} onClick={() => viewTodosFromTags(tag.id)}>
                    {numTodos} Todo{numTodos !== 1 && 's'}
                  </Button>
                }
                </Col><Col>
                {numProjects > 0 &&
                  <Button className = "my-1" variant="outline-light" style={{ width: "100%" }} onClick={() => viewProjectsFromTags(tag.id)}>
                    {numProjects} Project{numProjects !== 1 && 's'}
                  </Button>
                }
                  </Col>
                  </Row>
                </Card.Text>
          </Card.Body>
        </Card>
      </Col>
    );
  });

  return (
    <>
      <Button className="my-4" onClick={() => setEditingTag({})}>
        New tag
      </Button>
      {editingTag && (
        <TagsModal
          tag={editingTag}
          setTag={setEditingTag}
          refreshTags={refreshTags}
        />
      )}
      <div style={{ padding: "20px" }}>
        <Row xs={1} md={2} lg={3} className="g-3">
          {cards}
        </Row>
      </div>
    </>
  );
};
