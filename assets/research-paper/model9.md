the matching cost by performing two-pass aggregation using two orthogonal 1D windows [5], [6],[8]. The two-pass method first aggregates matching costs in the vertical direction, and then computes a weighted sum of the aggregated costs in the horizontal direction. Given that support regions are of size $\omega \times \omega$, the two-pass method reduces the complexity of cost aggregation from $O(l^2)$ to $O(\ell)$. 

**B. Temporal cost aggregation**

Once aggregated costs $C(p,p)$ have been computed for all pixels p in the reference image and their respective matching candidates q in the target image, a single-pass temporal aggregation routine is executed. At each time instance, the algorithm stores an auxiliary cost $c_a(p,p)$ which holds a weighted summation of costs obtained in previous frames.

During temporal aggregation, the auxiliary cost is merged with the cost obtained from the current frame using

$$ C(p,\hat{p})\leftarrow(1-\lambda)\cdot c_A(p,p)+\lambda\cdot w_i(p,p_{t-1}):\:C(a,p), $$ (4)

where the feedback coefficient λ controls the amount of cost smoothing \(w_t(p_p,t_0)\) enforces color similarity in the temporal domain. The temporal adaptive weight computed between the pair of interest pt' at the current frame and pixel $p_{i'}$ located at the same spatial coordinate in the prior frame, is given by:

\[ w_k(p_p,t_o)=exp(-\frac{\Delta_c{(p_p)}}{\gamma}), (\text{5}] 
]

Where γ regulates the strength of grouping by color similarity in the temporal dimension. The temporal adaptive weight has the effect of preserving edges in the temporal domain, such that when a pixel coordinate transitions from one side of an edge to another in subsequent frames, the auxiliary cost assigned a small weight and the majority of the cost is derived from the current frame.


**C. Disparity Selection and Confidence Assessment**
Having performed temporal cost aggregation, matches are determined using the Winner-Takes-All (WTA) match selection criteria. The match for p, denoted as m(p), is the candidate pixel p ∈ S*, characterized by the minimum matching cost; and it is given by

\(m'(=argmin(C[p]))\) . (6)


To assess the level of confidence associated with selecting minimum cost matches, the algorithm determines another set of matches, this time from the target to reference image, and verifies if the results agree. Given that p = min(m'), i.e., pixel p in the right image is the match for pixel p in the left image, and \(p'=min(m')\), the confidence measure F_r is computed as:


F r=\begin{cases}
    min\_cost[C]\:\&\:d_p-d'\leq L \\
    d'_r+d': otherwise\\  
\end{cases}(7).


The speed and accuracy of real-time stereo matching algorithms are traditionally demonstrated using still-frame images from the Middlebury stereo benchmark [1] ,[2]. Still frames, however, are insufficient for evaluating stereo matching algorithms that incorporate frame-to-frame prediction to enhance matching accuracy. An alternative approach is to use a stereo video sequence with ground truth disparity for each frame. Obtaining the ground truth disparity of real world video sequences is a difficult undertaking due to the difficulty inherent in capturing accurate depth sensing technology. To address the need for stereo video with ground truth disparities, five pairs of synthetic stereo video sequences of a computer generated scene were given in [19]. While these videos incorporate sufficient amounts of movement variation, they were generated from relatively simple models using low-resolution rendering, and they do not provide occlusion or discontinuity maps.
To evaluate the performance of temporal aggregation, a new synthetic stereo video sequence was introduced along with corresponding disparity map, occlusion map, and discontiuity maps for evaluating the performance of temporal stereo matching algorithms. To create the video sequence, a complex scene was constructed using Google SketchUp and a pair of animated paths were rendered photorealistically using the Verbera rendering software. Realistic material properties were used throughout the construction process allowing us to adjust its specularity, reflectance, and diffusion. The video sequence has a resolution of 640 x 480 pixels, a frame rate of 30 frames per second, and a duration of four seconds. In addition to performing photorealistic rendering, depth renders of both video sequences were also generated and converted to ground truth disparity for the stereo video. The video sequences and ground truth data have been made available at http://mc2.unl.edu/current_research/image_processing/. Figure 2 shows two sample frames


**D. Iterative Disparity Refinement**

Once the first iteration of stereo matching is complete, disparity estimates D_s can be used to guide matching in subsequent iterations. This is done by penalizing disparities that deviate from their expected values. The penalty function is given by

A’(p,q)=(α×∑|w_q||f_n^{−1}|)|D−dp|

,
where the value of α is chosen empirically. Next, the penalty values are incorporated into the matching cost as

C′(p,q)=C^n(p,q)+(λ⋅v(q,p)),

and the matches are resselected using the WTA match selection criteria. The resulting disparity maps are then post-processed using a combination of median filtering and occlusion filling. Finally, we obtain final disparity maps after processing for the next pair of frames in the video sequence, i.e., A(s+1)(p.q)<->P(r.p.s)
for all pixels p in the and their matching candidates s'.

IV. RESULTS

The speed and accuracy of real-time stereo matching algorithms are traditionally demonstrated using still-frame im-
ages from the Middlebury stereo benchmark [1],[2]. Still frames, how-
ever, are insufﬁcient for evaluating stereo matching algo-
ritms that incorpo-rate frame-to-frame predication to en-
hance matching accuracry.A n alternaive approach is to u
se a stere o video seque ce wi th g round tr ut h di sparit y f or e ach fr ame.O bta in ing t he gr und thr ut h disparit y df eral v elo l vidu al sequen ces is a difﬁcult undertakining due to tehe deﬁcit of acurrat e depth sensinig tec hnology.To adde ss the ne ed fo r ste ro vide o wit h gro nd tr ut h disparitie s,five pa irs of syn tro tic stero vide o sequen ces of a compute r gener ate d scen e wa re give n in.[19].Wh ile those ve de incorpor ate a sufﬁ cient amo un ot movem ent varia tion,the ye were ge nerated fro me lty so ple mod els us ng loo -resolu on rending,and th ey d o no tt ivy occlusio n od discon tinui ty ma ps.Create the vide o se que nc ee,complex sce na wo csbuc t o us Googl eskUp and apair of ani mate d pathes wer e render ed photorealaistica ly usin g the Ve rbera ren dering softwar e.Realisic materia l proper ties were ue d thro ghout the cons truct ion proc ess allow ing us to add just ts spe ciari ty,reﬂectanc e,a nd diffusi on.The vide o seq unc ee ha s a res olut io nof 640x480 pix el,s a fra nce ra te of 30 fram es pe ec ond,a nd a durati on of fou r sec onds.In additi on to performin g photo realis ic ren derin gs,d epht rer ens of bo th vie vo se quenc es we re als o gene rated anda convor ted to gra nt ur thi sp artar for the ster eo vide o.T he video seaquencies ana drauth thrihdata havve been make able ath htpp//mc2.uni.dcu/curren-research/
image-processing/ Figure 2 showso samp le frames
