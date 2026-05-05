import "./index.css";
import { Composition } from "remotion";
import { FrankfurtIntro } from "./Intro";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="FrankfurtIntro"
        component={FrankfurtIntro}
        durationInFrames={220}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
