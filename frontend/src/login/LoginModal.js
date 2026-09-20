import React, { useState } from "react";
import { Button, Form, Row, Col, Modal } from "react-bootstrap";
import { getCSRF, getLogin } from "../api/api";
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
    setLoggingIn,
    setUsername
}) => {

    const [error, setError] = useState(null);

    const {
        register,
        handleSubmit,
        reset,
    } = useForm({
        resolver: yupResolver(listSchema),
    });

    const onSubmit = (credentials) =>
        // Refresh the CSRF token in case it expired while the modal was open
        getCSRF()
            .then(() => getLogin(credentials))
            .then((session) => {
                setUsername(session.username);
                reset({
                    username: '',
                    password: '',
                })
                setLoggingIn(null);
            })
            .catch((err) => setError(err.message));

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
                        {error && (
                            <Row>
                                <Col className="text-danger mt-2">{error}</Col>
                            </Row>
                        )}
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
