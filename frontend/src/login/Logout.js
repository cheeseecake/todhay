import React from "react";
import { Button } from "react-bootstrap";
import { getLogout } from "../api/api";

export const Logout = ({
    setTags,
    setLists,
    setTodos,
    setWishlist,
    setUsername
}) => {
    const onSubmit = () =>
        getLogout()
            .then(() => {
                setUsername(false);
                setTags([]);
                setLists([]);
                setTodos([]);
                setWishlist([]);
            })

    return (
        <Button variant="outline-light" onClick={onSubmit} >
            Logout
        </Button >
    );
};
