import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./Card.module.scss";

interface CardProps {
  width: number;
  height: number;
  colorArr: string[];
}

export default function Card({ width, height, colorArr }: CardProps) {
  // 아래 요구사항을 모두 만족해야 하며, 특히 마지막 요구사항인 "Flip" 제스쳐 구현은 반드시 되야 합니다.
  // 모바일 기기에서 손가락을 이용한 동작이 잘 되는것이 중요하고, 마우스로도 동일하게 동작해야합니다.
  // 각 카드의 넓이와 높이는 서로 달라야 합니다.
  // 각 카드는 3초간 아무런 액션이 없으면, 자동으로 다음 카드로 전환됩니다.(AUTO TRANSITION)
  // 카드를 클릭하면 Alert으로 클릭한 카드의 색상을 보여줍니다.
  // 각 카드는 좌우로 이동할 수 있는 스와이프 기능이 있으며, 마우스와 손가락 제스쳐(모바일)로 가능합니다.
  // 스와이프 도중 - 드래그 양과 동일하게 카드가 이동해야 하며, opacity 또한 조정되야 합니다.(SWIPE)
  // 각 카드의 넓이의 50% 이상 움직인 상태에서 카드를 놓으면, 다음 카드로 전환합니다.(TO RIGHT / LEFT)
  // 각 카드의 넓이의 50% 미만으로 움직인 상태에서 카드를 놓으면, 기존 카드로 되돌아갑니다.(CANCEL)
  // Flip 기능
  // 손가락을 떼기 직전(TouchUp 또는 MouseUp)에 일정속도 이상으로 Flip 하였다면, 총 드래그 양과 무관하게 다음 카드로 이동합니다.(Flip right / left)

  const FLIP_TIME = 500; // ms
  const cardContainerRef = useRef<HTMLDivElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [title, setTitle] = useState<
    "Ready" | "Auto transition" | "swipe to left" | "swipe to right "
  >("Ready");

  const [direction, setDirection] = useState<"left" | "right" | "none">("none");
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [fliptime, setFliptime] = useState(0);

  const handleMouseDown = (e: any) => {
    e.preventDefault();

    setStartX(e.type === "touchstart" ? e.touches[0].clientX : e.clientX);
    setIsDragging(true);
    setDirection("none");
    setFliptime(new Date().getTime());
  };

  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();

    let clientX = 0;
    if (e.nativeEvent instanceof TouchEvent) {
      clientX = e.nativeEvent.touches[0].clientX;
    } else if (e.nativeEvent instanceof MouseEvent) {
      clientX = e.nativeEvent.clientX;
    }

    const deltaX = clientX - startX;
    const cardWidth = cardContainerRef.current?.offsetWidth || 0;
    const newTranslateX = deltaX;

    if (newTranslateX > 0) {
      // to right
      setDirection("right");
      setTitle("swipe to right ");
    } else if (newTranslateX < 0) {
      // to left
      setDirection("left");
      setTitle("swipe to left");
    }

    if (cardContainerRef.current) {
      cardContainerRef.current.style.transform = `translateX(${newTranslateX}px)`;
      cardContainerRef.current.style.opacity = `${
        1 - Math.abs(deltaX / cardWidth)
      }`;
    }
  };

  const handleMouseUp = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();

      if (direction === "none") {
        alert(colorArr[currentIndex]);
      }
      setDirection("none");
      setTitle("Auto transition");
      const cardWidth = cardContainerRef.current?.offsetWidth || 0;

      let clientX = 0;
      if (e.nativeEvent instanceof TouchEvent) {
        clientX = e.nativeEvent.changedTouches[0].clientX;
      } else if (e.nativeEvent instanceof MouseEvent) {
        clientX = e.nativeEvent.clientX;
      }

      // cardWidth의 50% 이상 움직였을 때 setCurrentIndex +1 하기 값이 음수이면 setCurrentIndex -1 하기
      if (Math.abs(clientX - startX) > cardWidth / 2) {
        if (clientX - startX > 0) {
          // to right
          if (currentIndex === colorArr.length - 1) {
            setCurrentIndex(0);
          } else {
            setCurrentIndex(currentIndex + 1);
          }
        } else {
          // to left
          if (currentIndex === 0) {
            setCurrentIndex(colorArr.length - 1);
          } else {
            setCurrentIndex(currentIndex - 1);
          }
        }
      }

      // flip : 클릭 후 FLIP_TIME 이내에 손가락을 떼었을 때
      if (new Date().getTime() - fliptime < FLIP_TIME) {
        if (clientX - startX > 0) {
          // to right
          if (currentIndex === colorArr.length - 1) {
            setCurrentIndex(0);
          } else {
            setCurrentIndex(currentIndex + 1);
          }
        } else {
          // to left
          if (currentIndex === 0) {
            setCurrentIndex(colorArr.length - 1);
          } else {
            setCurrentIndex(currentIndex - 1);
          }
        }
      }

      if (cardContainerRef.current) {
        cardContainerRef.current.style.transform = "";
        cardContainerRef.current.style.opacity = "1";
        setIsDragging(false);
      }
    },
    [direction, startX, colorArr, currentIndex]
  );

  const handleTransitionEnd = () => {
    // transition끝나면 다음 카드로 전환
    if (currentIndex === colorArr.length - 1) {
      setCurrentIndex(0);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  useEffect(() => {
    if (cardContainerRef.current) {
      // currentindex 바뀌면 색깔 바뀐후 transitionDuration한 도형 제자리로
      cardContainerRef.current.style.transitionDuration = "0s";
      cardContainerRef.current.style.transform = "";
      cardContainerRef.current.style.opacity = "1";
    }
  }, [currentIndex]);

  useEffect(() => {
    let timer: any;
    if (!isDragging) {
      timer = setInterval(() => {
        if (cardContainerRef.current) {
          cardContainerRef.current.style.transitionDuration = "0.3s";
          cardContainerRef.current.style.transform = `translateX(100%)`;
          cardContainerRef.current.style.opacity = "0.5";
          setTitle("Auto transition");
        }
      }, 3000);
    }
    return () => {
      clearInterval(timer);
    };
  }, [isDragging]);

  useEffect(() => {
    if (cardContainerRef.current) {
      cardContainerRef.current.style.transitionProperty = "all";
    }
    setTitle("Ready");

    return () => {
      setTitle("Ready");
    };
  }, []);

  const setOverlayColor = useCallback(() => {
    if (direction === "left") {
      return currentIndex === 0
        ? colorArr[colorArr.length - 1]
        : colorArr[currentIndex - 1];
    } else {
      return currentIndex === colorArr.length - 1
        ? colorArr[0]
        : colorArr[currentIndex + 1];
    }
  }, [currentIndex, direction]);

  return (
    <div className={styles.root}>
      <div className={styles.swipe}>
        {direction !== "none" ? `swipe to ${direction}` : `${title}`}
      </div>
      <div className={styles.cardRoot}>
        <div
          className={styles.cardOverlay}
          style={{
            backgroundColor: setOverlayColor(),
            width: `${width}px`,
            height: `${height}px`,
          }}
        >
          {setOverlayColor()}
        </div>
        <div
          style={{
            backgroundColor: colorArr[currentIndex],
            width: `${width}px`,
            height: `${height}px`,
          }}
          className={styles.card}
          onTransitionEnd={handleTransitionEnd}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMove}
          onTouchEnd={handleMouseUp}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMove}
          onMouseUp={handleMouseUp}
          ref={cardContainerRef}
        >
          {colorArr[currentIndex]}
        </div>
      </div>
    </div>
  );
}
