import FlowImage from '@/assets/Flow.svg';
import SpiderHappy from '@/assets/spider-happy.png';
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
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3, // delay between animations of child elements
      },
    },
  };

  const stepVariants = {
    hidden: {
      x: -100, // initial position to the left of the visible area
      opacity: 0
    },
    visible: {
      x: 0, // final position (normal)
      opacity: 1,
      transition: {
        type: 'spring', // animation type - spring effect
        stiffness: 100, // spring stiffness
        damping: 12, // damping
        duration: 0.5, // animation duration
      }
    },
  };

  return (
    <div className="flex flex-col flex-1 pt-14 pb-6">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
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
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }} // delay after steps animation
            >
              <img src={SpiderHappy} alt="Spider-happy" />
            </motion.div>
          </div>
        </div>
      </div>


      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="bg-secondary/20 rounded-md px-10 py-4 mb-12"
          >
            <span className="text-xl font-inter">Detailed explanation of how everything works</span>
          </motion.div>


          <motion.div
            className="flex flex-col mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.5 }}
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
