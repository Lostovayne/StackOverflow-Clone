import ROUTES from "@/constants/routes";
import Link from "next/link";
import Image from "next/image";
import TagCard from "../cards/TagCard";

const hotQuestions = [
  {
    _id: "1",
    title: "What is the best way to learn React?",
  },
  {
    _id: "2",
    title: "What is the best way to learn Tanstack?",
  },
  {
    _id: "3",
    title: "What is the best way to learn Next.js?",
  },
  {
    _id: "4",
    title: "What is the best way to learn Tailwind?",
  },
];

const popularTags = [
  { _id: "1", name: "react", questions: 100 },
  { _id: "2", name: "nextjs", questions: 90 },
  { _id: "3", name: "tailwind", questions: 80 },
  { _id: "4", name: "typescript", questions: 70 },
  { _id: "5", name: "javascript", questions: 60 },
  { _id: "6", name: "threejs", questions: 50 },
];

const RighSidebar = () => {
  return (
    <section className="pt-36 no-scrollbar background-light900_dark200 light-border sticky right-0 top-0 flex h-screen w-[350px] flex-col gap-6 overflow-y-auto border-l p-6 shadow-light-300 dark:shadow-none max-xl:hidden">
      <div>
        <h3 className="h3-bold text-dark200_light900">Top Questions</h3>

        <div className="mt-7 flex w-full flex-col gap-[30px]">
          {hotQuestions.map(({ _id, title }) => (
            <Link
              href={ROUTES.PROFILE(_id)}
              key={_id}
              className="flex cursor-pointer items-center justify-center gap-7"
            >
              <p className="body-medium text-dark500_light700">{title}</p>
              <Image
                src="/icons/chevron-right.svg"
                alt={"Chevron"}
                width={24}
                height={24}
              />
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-16">
        <h3 className="h3-bold text-dark200_light900">Pupular Tag</h3>
        <div className="mt-7 flex flex-col gap-4">
          {popularTags.map(({ _id, name, questions }) => (
            <TagCard
              key={_id}
              name={name}
              questions={questions}
              showCount
              compact
              _id={_id}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
export default RighSidebar;
