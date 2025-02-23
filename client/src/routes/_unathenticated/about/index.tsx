import { createFileRoute } from '@tanstack/react-router';

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
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="grid md:grid-cols-2 gap-16">
        {sections.map((section, index) => (
          <div
            key={index}
            className="flex flex-col gap-4 p-8 rounded-lg hover:bg-secondary/10 transition-colors"
          >
            <h2 className="text-4xl font-medium text-secondary">
              {section.title}
            </h2>
            <p className="text-lg text-content leading-relaxed">
              {section.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute('/_unathenticated/about/')({
  component: AboutComponent,
});
