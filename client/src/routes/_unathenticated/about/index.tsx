import { createFileRoute } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Copyright } from '../../../components/Copyright';

const sections = [
  {
    title: 'Our backgrounds',
    content: 'We are software engineers specializing in web application development. Our expertise lies in building high-load, scalable solutions across various industries, including fintech, cybersecurity, and healthcare. Our experience allows us to create reliable, scalable, and secure web applications tailored to the needs of modern businesses.'
  },
  {
    title: 'From Web2 to Web3',
    content: 'Our transition from Web2 to Web3 is driven by our passion for decentralization, transparency, and user empowerment. We see blockchain’s potential to enhance security, ownership, and scalability in web applications, making it a logical extension of our skill set. We see how Web3 solutions growing and we would like to be a part of the revolution!'
  },
  {
    title: 'Our mission',
    content: 'Our mission is to provide a secure and transparent platform for users to interact with Web3 applications. We believe in the power of blockchain technology to transform industries and create a more connected and empowered world.'
  },
  {
    title: 'Our vision',
    content: 'We envision a future where users have complete control over their digital identities and assets. Through blockchain technology and decentralized solutions, we aim to create a more transparent, secure, and user-centric web experience.'
  }
];

function AboutComponent() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // delay between animations of sections
        delayChildren: 0.3,   // initial delay before the first section animation
      },
    },
  };

  const sectionVariants = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 80,
        damping: 15,
      }
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        delay: 0.2
      }
    }
  };

  return (
    <div className="container mx-auto px-4 pt-36 pb-6 min-h-screen flex flex-col justify-between">
      <motion.div
        className="grid md:grid-cols-2 gap-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        viewport={{ once: true }}
      >
        {sections.map((section, index) => (
          <motion.div
            key={index}
            className="flex flex-col gap-4 p-8 rounded-lg hover:bg-secondary/10 transition-colors"
            variants={sectionVariants}
            whileHover={{
              scale: 1.03,
              boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
              backgroundColor: "rgba(var(--color-secondary), 0.15)"
            }}
          >
            <motion.h2
              className="text-4xl font-medium text-secondary"
              variants={titleVariants}
            >
              {section.title}
            </motion.h2>
            <motion.p
              className="text-lg text-content leading-relaxed"
              variants={contentVariants}
            >
              {section.content}
            </motion.p>
          </motion.div>
        ))}
      </motion.div>
      <motion.div
        className="w-full z-10 flex justify-center items-center relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <Copyright />
      </motion.div>
    </div>
  );
}

export const Route = createFileRoute('/_unathenticated/about/')({
  component: AboutComponent,
});
