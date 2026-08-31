import { Head, useForm } from "@inertiajs/react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Login({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post("/login");
    }

    return (
        <>
            <Head title="Masuk — Perfu.me Admin" />
            <div className="min-h-screen flex items-center justify-center bg-[#fafafa] font-sans">
                <div className="w-full max-w-3xl bg-white border border-[#e6e6e6] rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.06)] grid grid-cols-1 lg:grid-cols-[3fr_4fr]">
                    <div className="relative hidden lg:block bg-[#f7f7f7] objext-cover">
                        <img
                            src="/assets/brand-story.png"
                            alt="Perfu.me brand story"
                            className="absolute inset-0 w-full min-h-[500px] object-cover object-center"
                        />
                    </div>
                    {/* Kanan: form login */}
                    <div className="flex flex-col justify-center px-8 py-8">
                        <div className="mb-6">
                            <h1 className="font-sans text-2xl font-semibold text-[#1a1a1a]">
                                Masuk
                            </h1>
                            <p className="font-sans text-[12.5px] text-[#888] mt-1 leading-[1.7]">
                                Dashboard untuk mulai mengelola toko.
                            </p>
                        </div>

                        {status && (
                            <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 font-sans text-[12px] text-green-700">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="flex flex-col gap-4">
                            <Input
                                label="Email"
                                type="email"
                                placeholder="admin@perfu.me"
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                                error={errors.email}
                                required
                                autoFocus
                                autoComplete="email"
                            />
                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                value={data.password}
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                                error={errors.password}
                                required
                                autoComplete="current-password"
                            />

                            <Checkbox
                                label="Ingat saya"
                                checked={data.remember}
                                onCheckedChange={(v) => setData("remember", v)}
                                labelClassName="text-[#666]"
                            />

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full mt-2"
                            >
                                {processing ? "Memproses..." : "Masuk"}
                            </Button>
                        </form>

                        <p className="font-sans text-[11px] text-[#bbb] text-center mt-6">
                            Hanya admin terdaftar yang dapat masuk.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
