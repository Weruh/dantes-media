import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "react-router-dom";
import Section from "../components/Section";
import Card from "../components/Card";
import Badge from "../components/Badge";
import { Button } from "../components/Button";
import { Input, SelectField, Textarea } from "../components/Input";
import Alert from "../components/Alert";
import SalesCTA from "../components/SalesCTA";

const phoneRegex = /^[+\d\s()-]{7,}$/;

const quoteSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  company: z.string().optional(),
  email: z.string().email("Valid email required"),
  phone: z.string().regex(phoneRegex, "Valid phone required"),
  location: z.string().min(2, "Location is required"),
  serviceType: z.string().min(2, "Select a service type"),
  budgetRange: z.string().optional(),
  message: z.string().min(10, "Message is required"),
});

type QuoteValues = z.infer<typeof quoteSchema>;

const surveySchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().regex(phoneRegex, "Valid phone required"),
  siteLocation: z.string().min(2, "Site location is required"),
  preferredDate: z.string().min(1, "Select a preferred date"),
  preferredTime: z.string().min(1, "Select a preferred time"),
  siteType: z.string().min(2, "Select a site type"),
  floors: z.string().min(1, "Enter number of floors"),
  notes: z.string().optional(),
});

type SurveyValues = z.infer<typeof surveySchema>;

const serviceOptions = [
  "Hardware Solutions",
  "Software Solutions",
  "Programming Applications",
  "ICT Maintenance Contracts",
  "Security Systems",
  "Networking Implementations",
  "Consultancy",
  "Training",
];

const Contact = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"quote" | "survey">("quote");
  const [quoteSuccess, setQuoteSuccess] = useState(false);
  const [surveySuccess, setSurveySuccess] = useState(false);

  const quoteForm = useForm<QuoteValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      serviceType: "",
      budgetRange: "",
    },
  });

  const surveyForm = useForm<SurveyValues>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      preferredDate: "",
      preferredTime: "",
      siteType: "",
      floors: "",
    },
  });

  useEffect(() => {
    const stored = window.localStorage.getItem("dantes-quote-draft");
    if (stored) {
      try {
        quoteForm.reset(JSON.parse(stored) as QuoteValues);
      } catch {
        quoteForm.reset();
      }
    }
  }, [quoteForm]);

  useEffect(() => {
    const stored = window.localStorage.getItem("dantes-survey-draft");
    if (stored) {
      try {
        surveyForm.reset(JSON.parse(stored) as SurveyValues);
      } catch {
        surveyForm.reset();
      }
    }
  }, [surveyForm]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    const serviceType = searchParams.get("serviceType");

    if (tab === "survey") {
      setActiveTab("survey");
    }
    if (tab === "quote") {
      setActiveTab("quote");
    }
    if (serviceType) {
      quoteForm.setValue("serviceType", serviceType);
      setActiveTab("quote");
    }
  }, [quoteForm, searchParams]);

  useEffect(() => {
    const subscription = quoteForm.watch((values) => {
      window.localStorage.setItem("dantes-quote-draft", JSON.stringify(values));
    });
    return () => subscription.unsubscribe();
  }, [quoteForm]);

  useEffect(() => {
    const subscription = surveyForm.watch((values) => {
      window.localStorage.setItem("dantes-survey-draft", JSON.stringify(values));
    });
    return () => subscription.unsubscribe();
  }, [surveyForm]);

  const onQuoteSubmit = (values: QuoteValues) => {
    setQuoteSuccess(true);
    quoteForm.reset();
    window.localStorage.removeItem("dantes-quote-draft");
    void values;
  };

  const onSurveySubmit = (values: SurveyValues) => {
    setSurveySuccess(true);
    surveyForm.reset();
    window.localStorage.removeItem("dantes-survey-draft");
    void values;
  };

  return (
    <>
      <Helmet>
        <title>Contact | Dantes Media</title>
        <meta
          name="description"
          content="Contact Dantes Media for ICT services, security solutions, product sales, and networking support."
        />
      </Helmet>

      <Section>
        <Badge variant="outline">Contact</Badge>
        <h1 className="mt-4 text-4xl font-semibold text-ink-900 md:text-5xl">Let's plan your next upgrade.</h1>
        <p className="mt-4 max-w-2xl text-base text-ink-500">
          Choose a request type below and we'll respond with next steps, timelines, and a tailored proposal.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Phone", value: "+254(715) 578-015" },
            { title: "WhatsApp", value: "+254(722) 977-245" },
            { title: "Email", value: "info@dantesmediasolutions.co.ke" },
            { title: "Location", value: "Mombasa, Likoni" },
          ].map((item) => (
            <Card key={item.title}>
              <p className="text-xs uppercase tracking-[0.2em] text-brand-dark">{item.title}</p>
              <p className="mt-2 text-sm font-semibold text-ink-900">{item.value}</p>
            </Card>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-slate-100 bg-white p-6">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("quote")}
              className={`rounded-full px-4 py-2 text-xs font-semibold ${
                activeTab === "quote" ? "bg-brand/20 text-ink-900" : "bg-slate-100 text-ink-500"
              }`}
            >
              Talk to Sales
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("survey")}
              className={`rounded-full px-4 py-2 text-xs font-semibold ${
                activeTab === "survey" ? "bg-brand/20 text-ink-900" : "bg-slate-100 text-ink-500"
              }`}
            >
              Book A Site Survey
            </button>
          </div>

          {activeTab === "quote" && (
            <form onSubmit={quoteForm.handleSubmit(onQuoteSubmit)} className="mt-6 grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Full name" error={quoteForm.formState.errors.fullName?.message} {...quoteForm.register("fullName")} />
                <Input label="Company (optional)" {...quoteForm.register("company")} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Email" error={quoteForm.formState.errors.email?.message} {...quoteForm.register("email")} />
                <Input label="Phone" error={quoteForm.formState.errors.phone?.message} {...quoteForm.register("phone")} />
              </div>
              <Input label="Location" error={quoteForm.formState.errors.location?.message} {...quoteForm.register("location")} />
              <div className="grid gap-4 md:grid-cols-2">
                <SelectField label="Service type" error={quoteForm.formState.errors.serviceType?.message} {...quoteForm.register("serviceType")}>
                  <option value="">Select service</option>
                  {serviceOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </SelectField>
                <SelectField label="Budget range" {...quoteForm.register("budgetRange")}>
                  <option value="">Select range</option>
                  <option value="Below KES 2,000">Below KES 2,000</option>
                  <option value="KES 2,000 - KES 5,000">KES 2,000 - KES 5,000</option>
                  <option value="KES 5,000 - KES 15,000">KES 5,000 - KES 15,000</option>
                  <option value="KES 15,000+">KES 15,000+</option>
                </SelectField>
              </div>
              <Textarea label="Project details" error={quoteForm.formState.errors.message?.message} {...quoteForm.register("message")} />
              <Button type="submit">Submit Quote Request</Button>
              {quoteSuccess && <Alert tone="success">Thanks! We'll respond with next steps shortly.</Alert>}
            </form>
          )}

          {activeTab === "survey" && (
            <form onSubmit={surveyForm.handleSubmit(onSurveySubmit)} className="mt-6 grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Full name" error={surveyForm.formState.errors.fullName?.message} {...surveyForm.register("fullName")} />
                <Input label="Email" error={surveyForm.formState.errors.email?.message} {...surveyForm.register("email")} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Phone" error={surveyForm.formState.errors.phone?.message} {...surveyForm.register("phone")} />
                <Input label="Site location" error={surveyForm.formState.errors.siteLocation?.message} {...surveyForm.register("siteLocation")} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input type="date" label="Preferred date" error={surveyForm.formState.errors.preferredDate?.message} {...surveyForm.register("preferredDate")} />
                <Input type="time" label="Preferred time" error={surveyForm.formState.errors.preferredTime?.message} {...surveyForm.register("preferredTime")} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <SelectField label="Site type" error={surveyForm.formState.errors.siteType?.message} {...surveyForm.register("siteType")}>
                  <option value="">Select site type</option>
                  <option value="Office">Office</option>
                  <option value="Retail">Retail</option>
                  <option value="Warehouse">Warehouse</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Education">Education</option>
                </SelectField>
                <Input label="Number of floors" error={surveyForm.formState.errors.floors?.message} {...surveyForm.register("floors")} />
              </div>
              <Textarea label="Site notes (optional)" {...surveyForm.register("notes")} />
              <Button type="submit">Book Site Survey</Button>
              {surveySuccess && <Alert tone="success">Survey request received. We'll confirm scheduling.</Alert>}
            </form>
          )}
        </div>
      </Section>

      <Section>
        <SalesCTA
          title="Prefer a quick consult first?"
          subtitle="Talk to Sales and we'll suggest the right package and equipment list."
        />
      </Section>

      <a
        href="https://wa.me/10000000000"
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-ink-900 px-4 py-3 text-xs font-semibold text-white shadow-lg"
      >
        Need help?
      </a>
    </>
  );
};

export default Contact;



