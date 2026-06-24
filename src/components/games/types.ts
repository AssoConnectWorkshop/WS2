export type Candidate = {
  id: string;
  firstName: string;
  lastName: string;
  picture?: string | null;
};

export type GameProps = {
  candidates: Candidate[];
  onVote: (candidate: Candidate) => void;
  onChoose?: (candidate: Candidate) => void;
};
