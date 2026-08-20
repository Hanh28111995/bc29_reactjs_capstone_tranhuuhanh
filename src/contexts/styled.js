import styled from "styled-components";

export const WrapperSpin = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  background: #ffffffcc;
  @media screen and (max-width: 768px) {
    background: white;
  }
`;