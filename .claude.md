# Introduction

- This project is a take home assignment for an engineering job interview at https://railway.com

- The proompt is:

  > Build an application to spin up and spin down a container using our GQL API. Please deploy on Railway before the interview and we will review the code during your interview. The app needs to have a UI component and not just a backend that uses the API.

- The full context is:

    ```md
    The next step is a technical interview where we will discuss your solution to the project: "Build an application to spin up and spin down a container using our GQL API. Please deploy on Railway before the interview and we will review the code during your interview. The app needs to have a UI component and not just a backend that uses the API." You will submit your solution before the day of your scheduled meeting (via the link later in this email).


    We leave the prompt intentionally open-ended so we can get a better sense of what you would create on your own. This really shows your product-mindset. So feel free to go whatever direction you like best! The goal of the exercise is to spawn conversation so there are no correct answers here! We just love to see what you create, and have it be the basis for a great convo in the actual interview.


    The interview will be an hour, and would be structured as follows:
    Review your solution with the Team
    You'll sit down with a member of the team and go over the above. We'll poke into your solution, as well as get you acquainted with a member of the team.

    Interview structure:
    - 0-5 minutes: Introductions
    - 5-35 minutes: Walking through the code, talking about how you’d extend it
    - 35-50 minutes: Noodling on technology, frameworks, how you think about product
    - 50-60 minutes: Questions from candidate

    Below are two links to help you! The first you will use to submit your project prior to your interview. The second link is to schedule your interview directly with our team. Please let us know if anything doesn't look right once you click the link (ex: the closest interview slot is weeks away and you can't wait that long). We're happy to help!


    1) Please upload your project via this link by the morning of your interview (feel free to submit zip files, links to github or any other resources in the notes section): https://you.ashbyhq.com/Railway/assignment/7b30a1e0-b757-458c-84a9-8481dd7d1f74
    ```

# Brainstorming Project Idea

Recapping the requirments, they are:

- Spin up and spin down a container using our GQL API
- Needs to have a UI component
- Not just a backend that uses the API

todo

## Tools

We will use these tools to build our project.

- TypeScript for language
- Effect for standard library
- Vite - for build/framework
- React - for ui components
- React Router - for ui navigation and data loading

## Architecture

#### RSC

We will use the new experimental stack of RR+R+RSC+Vite. I have been working on a framework for months using Vite and RR and I explored RSC combo in early July. It has since matured with a working template to start from. I feel comfortable working from this base and also feel it holds much potential for both building great webapps while having great DX.

See docs at https://reactrouter.com/how-to/react-server-components.

Mentioned in those docs too, we will use Framework Mode, not Data Mode https://reactrouter.com/how-to/react-server-components#rsc-framework-mode.

We bootstrap by doing:

```sh
npx create-react-router@latest --template remix-run/react-router-templates/unstable_rsc-framework-mode
```

## Open Questions

I am not sure how to tackle components/styling yet. My short list is:

- PandaCSS
- Shadcn (= tailwind+Radix Primitives)
- Radix Themes
