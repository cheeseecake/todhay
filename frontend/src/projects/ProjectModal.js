import { format, parseISO } from "date-fns";
import React from "react";
import Select from "react-select";
import { Button, Row, Col, Form, Modal } from "react-bootstrap";
import { createType, deleteType, updateType } from "../api/api";
import { DATA_TYPES } from "../App";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const selectStyles = {
  control: (styles) => ({ ...styles, backgroundColor: '#16191c', color: "white" }),
  multiValueLabel: (styles) => ({...styles, backgroundColor: '#2a2c30', color: 'white'}),
  multiValueRemove:(styles) => ({...styles, backgroundColor: '#2a2c30', color: 'white'}),
  option: (styles, { isFocused, isSelected }) => {
    return {
      ...styles,
      backgroundColor: isFocused
        ? '#52525E'
        : isSelected
          ? '#000000'
          : '#16191c',
    }
  }
};

const projectSchema = yup
  .object({
    title: yup.string().required(),
    tags: yup.array().transform((v) => v.map((t) => t.value)),
    description: yup.string(),
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
        (v, ctx) =>
          !v ||
          parseISO(v) >= parseISO(ctx.parent.start_date)
      )
  })
  .required();

export const ProjectModal = ({ project, setProject, tags, refreshProjects }) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(projectSchema),
    defaultValues: {
      title: project?.title,
      tags: tags
        .filter((tag) => project.tags?.includes(tag.id))
        .map((tag) => ({ value: tag.id, label: tag.title })),
      description: project?.description,

      // If a created list didn't have a start_date, show nothing, else if
      // it's a new list (i.e. list is null) then show today's data by default
      start_date: project ? project.start_date : format(new Date(), "yyyy-MM-dd"),

      due_date: project?.due_date,
      completed_date: project?.completed_date,
    },
  });

  const onDelete = () =>
    window.confirm(`Delete '${project.title}?'`) &&
    deleteType(project, DATA_TYPES.PROJECTS).then(() => {
      refreshProjects();
      setProject(null);
    });

  const onSubmit = (data) => {
    const id = project?.id;

    const operation = id
      ? updateType({ id, ...data }, DATA_TYPES.PROJECTS) // Existing list
      : createType(data, DATA_TYPES.PROJECTS); // New list

    operation
      .then(() => {
        refreshProjects();
        setProject(null);
      })
      .catch(alert);
  };

  return (
    <Modal show onHide={() => setProject(null)} size="lg" backdrop="static">
      <Modal.Header closeButton>
        /{DATA_TYPES.PROJECTS.apiName}/{project.id || "<New Project>"}
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col xs={6}>
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
            <Col xs={6}>
              <Form.Group>
                <Form.Label>Tags</Form.Label>
                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder="Tags"
                      closeMenuOnSelect={false}
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
          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control
              {...register("description")}
              as="textarea"
              id="description"
              name="description"
              placeholder="Description"
            />
          </Form.Group>
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
                <p className="error">{errors.start_date?.message}</p>
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
