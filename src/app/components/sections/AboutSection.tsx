export function AboutSection() {
  const features = [
    "about",
    ,
  ];

  return (


    <section id="about" className="py-16 bg-gray-50 scroll-mt-20">

      <h2 className="text-4xl text-center mb-12 text-gray-900">Enjoy a Stunning A-Frame Cabin in Malvar, Batangas</h2>


      {/* Details Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-semibold mb-4">

            </h2>

            <p className="text-neutral-600 mb-4">
              Enjoy this stunningly beautiful A-frame cabin nestled inside a private
              farm in Malvar, Batangas. Warm up around our cushioned firepit as you melt
              marshmallows for s’mores, sip hot chocolate, and catch up with family and
              friends.
            </p>

            <p className="text-neutral-600 mb-4">
              Go star-gazing while floating in our infinity pool, grill some barbecue,
              enjoy karaoke, or simply bask in the beauty of nature while breathing in
              fresh air surrounded by tall coconut trees.
            </p>

            <p className="text-neutral-600 mb-6">
              Ohannah Cabin is ideal for family and group get-togethers and is often
              chosen to celebrate special occasions. It features a spacious deck with
              low boho tables, an infinity pool, karaoke, and a cozy outdoor firepit.
            </p>



            <div className="text-neutral-600 space-y-2">
              <p className="font-semibold mt-4">Sleeping Arrangement</p>
              <ul className="list-disc list-inside">
                <li>Bedroom: 2 Queen Beds (plus optional single floor bed)</li>
                <li>Loft: 2 Queen Beds (plus 1 Queen and 2 Single Beds if needed)</li>
                <li>Total: 5 Queen Beds and 2 Single Beds</li>
              </ul>

              <p className="mt-4 text-sm text-neutral-500">
                ⚠️ Cooking and smoking are not allowed inside the cabin. An outdoor
                griller and cooking area are provided. Please do not throw cigarette
                butts on the artificial grass.
              </p>
            </div>
          </div>


          <div className="rounded-lg overflow-hidden shadow-xl">
            <img
              src="/section/about.jpg"
              alt="Ohannah Cabin exterior"
              className="w-full h-full object-cover aspect-[4/3]"
            />
          </div>


        </div>




      </div>
    </section>
  );
}
