import useEventListener from "@use-it/event-listener";
import moment from "moment-timezone/builds/moment-timezone-with-data";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import _Clock from "react-clock";
import "react-clock/dist/Clock.css";
import ReactCountryFlag from "react-country-flag";
import styled from "styled-components";
import { DaylightMap } from "./DaylightMap";

const LOCATIONS = [
  {
    tz: "America/Los_Angeles",
    city: "San Francisco",
    country: "US",
  },
  {
    tz: "America/Chicago",
    city: "Chicago",
    country: "US",
  },
  {
    tz: "America/New_York",
    city: "New York",
    country: "US",
  },
  {
    tz: "UTC",
    city: "UTC",
    country: "GB",
  },
  {
    tz: "Europe/Helsinki",
    city: "Helsinki",
    country: "FI",
  },
];

const Clock = styled(_Clock)`
  & .react-clock__face {
    border-color: white;
  }
  & .react-clock__hand__body {
    background-color: white;
  }
  & .react-clock__mark__body {
    background-color: white;
  }
`;

const ClockWrapper = styled.div`
  text-align: center;
  position: relative;
`;

const TimeZoneText = styled.span`
  color: white;
`;

const CurrentTimeText = styled.span`
  color: white;
  font-size: 1.25em;
  position: absolute;
  top: 140px;

  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
`;

const CountryFlag = styled(ReactCountryFlag)`
  &[style] {
    height: 1em !important;
    width: ${(4 / 3) * 1}em !important;
  }
`;

const ZonedClock = ({ now, tz, city, country }) => {
  const nowZoned = now.clone().tz(tz);

  return (
    <ClockWrapper>
      <CurrentTimeText>{nowZoned.format("HH:mm")}</CurrentTimeText>
      {/*<TimeZoneText>{nowZoned.format("z")}</TimeZoneText>*/}
      <Clock
        value={nowZoned.format("HH:mm:ss")}
        size={200}
        renderSecondHand={false}
      />
      <TimeZoneText>{city}</TimeZoneText>
      &nbsp;
      <CountryFlag svg countryCode={country} />
    </ClockWrapper>
  );
};

ZonedClock.propTypes = {
  now: PropTypes.instanceOf(moment).isRequired,
  tz: PropTypes.string.isRequired,
};

const FullScreenNotice = styled.span`
  position: fixed;
  top: 5px;
  left: 5px;
  color: white;
  font-size: 0.5em;

  html:fullscreen & {
    display: none;
  }
`;

function App() {
  const [now, setNow] = useState(moment());

  useEffect(() => {
    const interval = setInterval(
      () =>
        setNow((prevNow) => {
          const newNow = moment().startOf("minute");
          if (newNow.isSame(prevNow)) {
            return prevNow;
          } else {
            return newNow;
          }
        }),
      1000
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEventListener("keydown", (e) => {
    if (e.code === "Enter" && e.metaKey) {
      e.preventDefault();
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen({ navigationUI: "hide" });
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    }
  });

  return (
    <div>
      <FullScreenNotice>Go full screen! (Command + Enter)</FullScreenNotice>
      <Container fluid>
        <Row>
          <DaylightMap now={now} />
        </Row>

        <Row style={{ marginTop: "2em" }}>
          {LOCATIONS.map((location) => (
            <Col className="d-flex justify-content-center" key={location.tz}>
              <ZonedClock now={now} {...location} />
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
}

export default App;
