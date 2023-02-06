import React from "react";
import { Button, Form, Row, Col, Modal } from "react-bootstrap";
import { getLogin } from "../api/api";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const listSchema = yup
    .object({
        username: yup.string().required(),
        password: yup.string().required()
    })
    .required();

export const LoginModal = ({
    refreshTags,
    refreshProjects,
    refreshTodos,
    refreshWishlist,
    setLoggingIn
}) => {

    const {
        register,
        handleSubmit,
        reset,
    } = useForm({
        resolver: yupResolver(listSchema),
    });

    const onSubmit = (credentials) =>

        getLogin(credentials)
            .then(() => {
                refreshTags();
                refreshProjects();
                refreshTodos();
                refreshWishlist();
                reset({
                    username: '',
                    password: '',
                })
                setLoggingIn(null);
            })

    return (
        <>
            <Modal show size="lg" onHide={() => setLoggingIn(null)} backdrop="static">
                <Modal.Header closeButton>
                    Welcome
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row>
                            <Col>
                                <Form.Group>
                                    <Form.Control
                                        {...register("username")}
                                        type="text"
                                        id="username"
                                        name="username"
                                        placeholder="Username"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group>
                                    <Form.Control
                                        {...register("password")}
                                        type="password"
                                        id="password"
                                        name="password"
                                        placeholder="Password"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-light" onClick={handleSubmit(onSubmit)} >
                        Login
                    </Button>
                </Modal.Footer>
            </Modal>
        </>)
};
