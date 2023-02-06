import { format, parseISO } from "date-fns";
import React, { useState } from "react";
import Select from "react-select";
import { Button, Row, Col, Form, Modal } from "react-bootstrap";
import { updateType, createType, deleteType } from "../api/api";
import { DATA_TYPES } from "../App";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

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
  option: (styles, { isFocused, isSelected, isDisabled }) => {
    return {
      ...styles,
      backgroundColor: isFocused
        ? "#52525E"
        : isSelected
        ? "#000000"
        : "#16191c",
      color: isDisabled ? "black" : "white",
    };
  },
};

const todoSchema = yup
  .object({
    title: yup.string().required(),
    description: yup.string(),
    project: yup.string(),
    tags: yup.array().transform((v) => v.map((t) => t.value)),
    effort: yup.number(),
    reward: yup.number(),
    frequency: yup
      .string()
      .nullable()
      .transform((v) => (v === "" ? null : v)),
    end_date: yup
      .string()
      .nullable()
      .transform((v) => (v === "" ? null : v)),
    current_streak: yup.number(),
    max_streak: yup.number(),
    start_date: yup
      .string()
      .nullable()
      .when("completed_date", {
        // Require start_date if there is a completed_date
        is: (v) => !!v,
        then: yup
          .string()
          .nullable()
          .required("Start date is required if completed date is specified"),
      })
      .transform((v) => v || null),
    due_date: yup
      .string()
      .nullable()
      .transform((v) => v || null),
    completed_date: yup
      .string()
      .nullable()
      .transform((v) => v || null)
      .test(
        "invalid_date",
        "Completed date must not be before start date",
        (v, ctx) => !v || parseISO(v) >= parseISO(ctx.parent.start_date)
      ),
  })
  .required();

export const TodosModal = ({
  projects,
  tags,
  refreshTodos,
  refreshTodoTodos,
  setTodo,
  todo
}) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(todoSchema),
    defaultValues: {
      title: todo?.title,
      description: todo?.description,
      project: todo?.project || "37975118-b68a-4fcd-9fc6-43cad1f39b1d",
      tags: tags
        .filter((tag) => todo.tags?.includes(tag.id))
        .map((tag) => ({ value: tag.id, label: tag.title })),
      effort: todo?.effort || 0.5,
      reward: todo?.reward || 5,
      frequency: todo?.frequency,
      end_date: todo?.end_date,
      start_date: todo ? todo.start_date : format(new Date(), "yyyy-MM-dd"),
      due_date: todo?.due_date,
      completed_date: todo?.completed_date,
    },
  });

  const [effort, setEffort] = useState(todo?.effort || 0.5);

  const onSubmit = (data) => {
    const id = todo?.id;
    console.log(data);

    data.tags =
      data.project !== "37975118-b68a-4fcd-9fc6-43cad1f39b1d"
        ? projects
            .filter((project) => project.id === data.project)
            .map((project) => project.tags)[0]
        : data.tags;
    const operation = id
      ? updateType({ id, ...data }, DATA_TYPES.TODOS) // Existing todo
      : createType(data, DATA_TYPES.TODOS); // New todo

    operation
      .then(() => {
        refreshTodoTodos();
        refreshTodos();
        setTodo(null);
        setTimeout(() => {
          alert("Saved!");
        }, 1000);
      })
      .catch(alert);
  };

  const onDelete = () =>
    window.confirm(`Delete '${todo.title}?'`) &&
    deleteType(todo, DATA_TYPES.TODOS).then(() => {
      refreshTodoTodos();
      refreshTodos();
      setTodo(null);
    });

  return (
    <Modal show onHide={() => setTodo(null)} size="lg" backdrop="static">
      <Modal.Header closeButton>
        /{DATA_TYPES.TODOS.apiName}/{todo?.id || "<New Todo>"}
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col xs={12}>
              <Form.Group>
                <Form.Label>Title</Form.Label>
                <Form.Control
                  {...register("title")}
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Title"
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col xs={4}>
              <Form.Group>
                <Form.Label>Project</Form.Label>
                <Form.Select {...register("project")} name="project">
                  {projects.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={8}>
              <Form.Group>
                <Form.Label>Tags</Form.Label>
                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder="Tags"
                      isSearchable={false}
                      isMulti
                      styles={selectStyles}
                      options={tags.map((tag) => ({
                        value: tag.id,
                        label: tag.title,
                      }))}
                    />
                  )}
                />
                <p className="error">{errors.tags?.message}</p>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col xs={3}>
              <Form.Group>
                <Form.Label>Effort (hrs) - {effort * 60} min</Form.Label>
                <Form.Control
                  {...register("effort")}
                  type="integer"
                  name="effort"
                  onChange={(e) => setEffort(e.target.value)}
                />
                <p className="error">{errors.effort?.message}</p>
              </Form.Group>
            </Col>
            <Col xs={3}>
              <Form.Group>
                <Form.Label>Reward ($) - ${effort * 10}</Form.Label>
                <Form.Control
                  {...register("reward")}
                  type="integer"
                  name="reward"
                />
                <p className="error">{errors.reward?.message}</p>
              </Form.Group>
            </Col>
            <Col xs={3}>
              <Form.Group>
                <Form.Label>Frequency</Form.Label>
                <Form.Select {...register("frequency")} name="frequency">
                  <option value={""}>One-time</option>
                  <option value={"DAILY"}>Daily</option>
                  <option value={"WEEKLY"}>Weekly</option>
                  <option value={"MONTHLY"}>Monthly</option>
                  <option value={"QUATERLY"}>Quarterly</option>
                  <option value={"YEARLY"}>Yearly</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={3}>
              <Form.Group>
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  {...register("end_date")}
                  type="date"
                  name="end_date"
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                {...register("description")}
                style={{ height: "150px" }}
                as="textarea"
                id="description"
                name="description"
                placeholder="Description"
              />
            </Form.Group>
          </Row>
          <Row>
            <Col xs={4}>
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  {...register("start_date")}
                  type="date"
                  id="start_date"
                  name="start_date"
                />
              </Form.Group>
            </Col>
            <Col xs={4}>
              <Form.Group>
                <Form.Label>Due Date</Form.Label>
                <Form.Control
                  {...register("due_date")}
                  type="date"
                  id="due_date"
                  name="due_date"
                />
              </Form.Group>
            </Col>
            <Col xs={4}>
              <Form.Group>
                <Form.Label>Completed Date</Form.Label>
                <Form.Control
                  {...register("completed_date")}
                  type="date"
                  id="completed_date"
                  name="completed_date"
                />
                <p className="error">{errors.completed_date?.message}</p>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" className="me-auto" onClick={onDelete}>
          Delete
        </Button>
        <Button variant="success" onClick={handleSubmit(onSubmit)}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
