import { format } from "date-fns";
import React, { useState } from "react";
import { Button, Card, Row, Col, ProgressBar, OverlayTrigger, Tooltip } from "react-bootstrap";
import { updateType } from "../api/api";
import { DATA_TYPES } from "../App";
import { formatDays } from "../shared/util";
import { WishlistModal } from "./WishlistModal";

export const Wishlist = ({ totalRewards, refreshWishlist, wishlist }) => {
  const [editingWish, setEditingWish] = useState();

  const claimedRewards = wishlist.reduce(
    (acc, wish) => acc + parseFloat(wish.cost) * parseFloat(wish.count),
    0
  );

  const availableRewards = totalRewards - claimedRewards;

  const redeemWish = (wish) =>
    updateType({
      ...wish,
      count: wish.count + 1,
      last_purchased_date: format(new Date(), "yyyy-MM-dd")
    },
      DATA_TYPES.WISHLIST)
      .then(refreshWishlist)
      .catch(alert);

  // Sort wishlist by topic, title
  wishlist = wishlist.sort(
    (a, b) =>
      b.repeat - a.repeat ||
      new Date(a.last_purchased_date) - new Date(b.last_purchased_date) ||
      a.cost - b.cost
  );
  const cards = wishlist.map((wish) => {
    /* A wish is reedeemable if the count is 0, OR it's a repeatable wish
    (a repeatable wish is always redeemable, the count just increases) */
    let isWishRedeemable = wish.count === 0 || wish.repeat;

    return (
      <Col key={wish.id}>
        <Card
          onClick={() => setEditingWish(wish)}
          text="white"
          bg="dark"
          style={{
            cursor: "pointer",
          }}
        >
          {wish.img_url && (
            <Card.Img
              width="100%"
              src={wish?.img_url}
              alt="img"
              onClick={(e) => {
                e.stopPropagation();
                if (wish?.product_url) {
                  window.open(wish?.product_url, "_blank", "noopener,noreferrer");
                } else {
                  alert("No Product URL specified");
                }
              }}
            />
          )}

          <Card.Body>
            <Card.Title tag="h5">
              {wish.title} x{wish?.count}
            </Card.Title>
            <Card.Subtitle className="subtitle">
              {wish.last_purchased_date
                && `Purchased ${formatDays(wish.last_purchased_date)}`
              }
            </Card.Subtitle>
          </Card.Body>
          <Card.Footer>
            {isWishRedeemable &&
              (wish.cost <= availableRewards
                ? (<Button
                  variant="success"
                  onClick={(e) => {
                    e.stopPropagation();
                    redeemWish(wish);
                  }}
                >
                  Redeem
                </Button>)
                :
                <OverlayTrigger
                  placement='bottom'
                  overlay={
                    <Tooltip id={wish.id}>
                      Earn ${(parseFloat(wish.cost) - availableRewards).toFixed(1)} more to redeem.
                    </Tooltip>
                  }
                >
                  <ProgressBar variant="success" now={100 * (availableRewards / wish.cost)} />
                </OverlayTrigger>
              )}
            {" "}${parseFloat(wish.cost).toFixed(1)}
          </Card.Footer>
        </Card>
      </Col >
    );
  });

  return (
    <>
      {editingWish && (
        <WishlistModal
          wish={editingWish}
          setWish={setEditingWish}
          refreshWishlist={refreshWishlist}
        />
      )}
      <Button className="my-4" onClick={() => setEditingWish({})}>
        New wish
      </Button>
      <ProgressBar className="my-2">
        <ProgressBar
          variant="success"
          now={100 * (availableRewards / totalRewards)}
          label={`$${availableRewards.toFixed(1)} avail`}
          key={1} />
        <ProgressBar
          style={{ backgroundColor: "#064b35" }}
          now={100 * (claimedRewards / totalRewards)}
          label={`$${claimedRewards.toFixed(1)} claimed`}
          key={2} />
      </ProgressBar>

      <div style={{ padding: "20px" }}>

        <Row xs={1} md={3} lg={5} className="g-3">
          {cards}
        </Row>
      </div>
    </>
  );
};
