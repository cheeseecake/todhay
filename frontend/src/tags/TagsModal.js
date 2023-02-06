import React from "react";
import { Button, Form, Modal, Row, Col } from "react-bootstrap";
import { DATA_TYPES } from "../App";
import { createType, deleteType, updateType } from "../api/api";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const tagSchema = yup.object({
  title: yup.string().required(),
  topic: yup.boolean().required(),
  description: yup.string(),
}).required();

export const TagsModal = ({ setTag, tag, refreshTags }) => {
  const { register, handleSubmit } = useForm({
    resolver: yupResolver(tagSchema),
    defaultValues: {
      title: tag?.title,
      tags: tag.topic || true,
      description: tag?.description
    }
  });

  const onDelete = () =>
    window.confirm(`Delete ${tag?.title}?`) &&
    deleteType(tag, DATA_TYPES.TAGS).then(() => {
      refreshTags();
      setTag(null);
    });

  const onSubmit = (data) => {
    const id = tag?.id;

    const operation = id
      ? updateType({ id, ...data }, DATA_TYPES.TAGS) // Existing wish
      : createType(data, DATA_TYPES.TAGS); // New wish

    operation
      .then(() => {
        refreshTags();
        setTag(null);
      })
      .catch(alert);
  };

  return (
    <Modal show onHide={() => setTag(null)} size="lg" backdrop="static">
      <Modal.Header closeButton>
        /{DATA_TYPES.TAGS.apiName}/{tag.id || "<New Tag>"}
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Row>
            <Col xs={8}>
              <Form.Group>
                <Form.Label>Title</Form.Label>
                <Form.Control
                  {...register("title")}
                  type="text"
                  name="title"
                  placeholder="Title"
                  required
                />
              </Form.Group>
            </Col>
            <Col xs={4}>
              <Form.Group>
                <Form.Label>Topic</Form.Label>
                <Form.Select
                  {...register("topic")}
                  name="topic"
                >
                  <option value={true}>true</option>
                  <option value={false}>false</option>
                </Form.Select>
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
