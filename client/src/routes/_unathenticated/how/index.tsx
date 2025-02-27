import FlowImage from '@/assets/Flow.svg';
import SpiderHappy from '@/assets/spider-happy.png';
import { useHowItWorksAnimations } from '@/hooks/useAnimations';
import { createFileRoute } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Copyright } from '../../../components/Copyright';

const steps = [
  {
    number: '1/',
    title: 'Connect wallet',
  },
  {
    number: '2/',
    title: 'Sign In',
  },
  {
    number: '3/',
    title: 'Approve providers',
  },
];

function HowItWorksComponent() {
  const {
    containerVariants,
    stepVariants,
    sectionTitleVariants,
    imageVariants,
    flowImageVariants
  } = useHowItWorksAnimations();

  return (
    <div className="flex flex-col flex-1 pt-14 pb-6">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={sectionTitleVariants}
            className="bg-secondary/20 rounded-md px-10 py-4 mb-12"
          >
            <span className="text-xl font-inter">Simple steps for the user</span>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              className="flex flex-col gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              viewport={{ once: true }}
            >
              {steps.map((step) => (
                <motion.div
                  key={step.number}
                  className="flex items-center gap-4"
                  variants={stepVariants}
                >
                  <span className="text-5xl font-bold text-secondary">
                    {step.number}
                  </span>
                  <span className="text-5xl font-medium text-content-contrast">
                    {step.title}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="flex justify-center"
              variants={imageVariants}
              initial="hidden"
              animate="visible"
            >
              <img src={SpiderHappy} alt="Spider-happy" />
            </motion.div>
          </div>
        </div>
      </div>


      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={sectionTitleVariants}
            transition={{ delay: 1.2 }}
            className="bg-secondary/20 rounded-md px-10 py-4 mb-12"
          >
            <span className="text-xl font-inter">Detailed explanation of how everything works</span>
          </motion.div>


          <motion.div
            className="flex flex-col mt-12"
            variants={flowImageVariants}
            initial="hidden"
            animate="visible"
          >
            <img src={FlowImage} alt="Flow" />
          </motion.div>
        </div>
      </div>
      <div className="w-full z-10 flex justify-center items-center relative">
        <Copyright />
      </div>
    </div>
  );
}

export const Route = createFileRoute('/_unathenticated/how/')({
  component: HowItWorksComponent,
});
