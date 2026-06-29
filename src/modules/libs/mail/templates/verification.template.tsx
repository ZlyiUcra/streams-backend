import { Body, Head, Heading, Link, Preview, Section, Tailwind, Text } from "@react-email/components";
import { Html } from "@react-email/html";
import React from "react";

interface VerificationTemplateProps {
    domain: string
    token: string
}


export function VerificationTemplate({domain, token}: VerificationTemplateProps){
    const verificationLink = `${domain}/account/verify?token=${token}`
    return (<Html>
        <Head />
        <Preview>Account verification</Preview>
        <Tailwind>
            <Body className="max-w-2xl mx-auto p-6 bg-slate-50">
                <Section className="text-center mb-8">
                    <Heading className="text-3xl text-black font-bold">Email confirmation</Heading>
                    <Text className="text-base text-black">
                        Thank you for registering on our platform! To confirm your email address, please follow the link below:
                    </Text>
                    <Link href={verificationLink} className="inline-flex justify-center items-center rounded-full text-sm font-medium text-white bg-[#18B9AE] p-2">
                        Confirm email
                    </Link>
                </Section>
                <Section className="text-center mt-8">
                    <Text className="text-gray-600">
                        If you have any questions or run into any difficulties, feel free to reach out to our support team at
                        <Link
                            href="mailto:gochualex@gmail.com"
                            className="text-[#18B9AE] underline ml-2"
                        >
                            Support
                        </Link>.
                    </Text>
                </Section>
            </Body>
        </Tailwind>
    </Html>)
}